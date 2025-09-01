import { Inject, Injectable } from '@nestjs/common';
import {
  ConfigProviderService,
  Constants as CoreConstants,
  GenericObject,
  PersistanceOrderBy,
  PersistanceOrderByDirection,
  PersistanceSelectOperator,
  RDBType
} from '@node-c/core';

import ld from 'lodash';

import { BuildQueryOptions, IncludeItems, ParsedFilter } from './rdb.sqlQueryBuilder.definitions';

import { Constants } from '../common/definitions';
import { OrmBaseQueryBuilder, OrmSelectQueryBuilder } from '../ormQueryBuilder';

@Injectable()
export class SQLQueryBuilderService {
  allowedStringOperators: string[] = Object.values(PersistanceSelectOperator);
  columnQuotesSymbol: string;
  dbType: RDBType | string;
  iLikeSupported: boolean;

  constructor(
    public configProvider: ConfigProviderService,
    @Inject(Constants.SQL_BUILDER_DB_CONFIG_PATH)
    public dbConfigPath: string,
    @Inject(CoreConstants.PERSISTANCE_MODULE_NAME)
    // eslint-disable-next-line no-unused-vars
    public persistanceModuleName: string
  ) {
    const { type } = ld.get(configProvider, dbConfigPath) as { type: RDBType };
    this.dbType = type;
    if (type === RDBType.Aurora || type === RDBType.ClickHouse || type === RDBType.MySQL) {
      this.columnQuotesSymbol = '`';
      this.iLikeSupported = false;
    } else if (type === RDBType.PG) {
      this.columnQuotesSymbol = '"';
      this.iLikeSupported = true;
    }
  }

  buildQuery<Entity>(
    ormQueryBuilder: OrmBaseQueryBuilder<Entity> | OrmSelectQueryBuilder<Entity>,
    options: BuildQueryOptions
  ): void {
    const { where, include, orderBy, select, withDeleted = false } = options;
    const cqs = this.columnQuotesSymbol;
    const deletedColumnName = options.deletedColumnName || 'deletedAt';
    if ('withDeleted' in ormQueryBuilder) {
      const oqb = ormQueryBuilder as OrmSelectQueryBuilder<Entity>;
      if (withDeleted) {
        oqb.withDeleted();
      }
      if (include) {
        for (const relationProperty in include) {
          if (withDeleted) {
            oqb.leftJoinAndSelect(relationProperty, include[relationProperty]);
          } else {
            oqb.leftJoinAndSelect(
              relationProperty,
              include[relationProperty],
              `${cqs}${include[relationProperty]}${cqs}.${cqs}${deletedColumnName}${cqs} IS NULL`
            );
          }
        }
      }
      if (select && select.length) {
        oqb.select(this.parseSelect(select, include));
      }
    }
    if (where) {
      let isFirst = true;
      for (const fieldName in where) {
        const whereItem = where[fieldName];
        if (!whereItem.query.length) {
          continue;
        }
        let methodName = 'where';
        if (isFirst) {
          isFirst = false;
        } else {
          methodName = fieldName === PersistanceSelectOperator.Or ? 'orWhere' : 'andWhere';
        }
        (ormQueryBuilder as unknown as { [methodName: string]: (..._args: unknown[]) => void })[methodName](
          whereItem.query,
          whereItem.params
        );
      }
    }
    if (orderBy && 'orderBy' in ormQueryBuilder) {
      const oqb = ormQueryBuilder as OrmSelectQueryBuilder<Entity>;
      let isFirst = true;
      for (const item of orderBy) {
        let methodName: 'orderBy' | 'addOrderBy' = 'addOrderBy';
        if (isFirst) {
          methodName = 'orderBy';
          isFirst = false;
        }
        oqb[methodName](item.field, item.direction);
      }
    }
  }

  getValueForFilter(
    entityName: string,
    fieldName: string,
    fieldAlias: string,
    fieldValue: unknown,
    isNot: boolean,
    operator?: PersistanceSelectOperator
  ): ParsedFilter {
    const { columnQuotesSymbol: cqs, dbType } = this;
    const escapedFieldAlias = fieldAlias.replace(/\$/, '__ds__');
    const fieldString = `${cqs}${entityName}${cqs}.${cqs}${fieldName}${cqs}`;
    let parsedInnerValue = fieldValue instanceof Date ? fieldValue.valueOf() : fieldValue;
    if (operator === PersistanceSelectOperator.Contains) {
      let query = '';
      // TODO: fix JSON_CONTAINS here for ClickHouse
      if (dbType === RDBType.Aurora || dbType === RDBType.ClickHouse || dbType === RDBType.MySQL) {
        query = `JSON_CONTAINS(${fieldString}, :${escapedFieldAlias})`;
        parsedInnerValue = `"${parsedInnerValue}"`;
      } else if (dbType === RDBType.PG) {
        query = `${fieldString} ? :${escapedFieldAlias}`;
      }
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query
      };
    }
    if (operator === PersistanceSelectOperator.GreaterThan) {
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query: `${fieldString} > :${escapedFieldAlias}`
      };
    }
    if (operator === PersistanceSelectOperator.GreaterThanOrEqual) {
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query: `${fieldString} >= :${escapedFieldAlias}`
      };
    }
    if (operator === PersistanceSelectOperator.LessThan) {
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query: `${fieldString} < :${escapedFieldAlias}`
      };
    }
    if (operator === PersistanceSelectOperator.LessThanOrEqual) {
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query: `${fieldString} <= :${escapedFieldAlias}`
      };
    }
    if (
      operator === PersistanceSelectOperator.Like ||
      (operator === PersistanceSelectOperator.ILike && !this.iLikeSupported)
    ) {
      return {
        params: { [escapedFieldAlias]: parsedInnerValue },
        query: `${fieldString}${isNot ? ' not ' : ' '}` + `like :${escapedFieldAlias}`
      };
    }
    if (operator === PersistanceSelectOperator.ILike) {
      return {
        params: { [escapedFieldAlias]: typeof parsedInnerValue },
        query: `${fieldString}${isNot ? ' not ' : ' '}` + `ilike :${escapedFieldAlias}`
      };
    }
    return {
      params: { [escapedFieldAlias]: parsedInnerValue },
      query: `${fieldString} ${isNot ? '!=' : '='} :${escapedFieldAlias}`
    };
  }

  parseArrayOfFilters(
    filtersArray: unknown[],
    fieldAlias: string
  ): {
    hasValues: boolean;
    isSimple: boolean;
    paramsForQuery: GenericObject;
    queryTemplateParamNames: string;
  } {
    let isSimple = true;
    let hasValues = false;
    const paramsForQuery: GenericObject = {};
    let queryTemplateParamNames = '';
    for (const i in filtersArray) {
      const fieldValueItem = filtersArray[i];
      if (typeof fieldValueItem === 'undefined') {
        continue;
      }
      if (!hasValues) {
        hasValues = true;
      }
      if (
        fieldValueItem === null ||
        typeof fieldValueItem === 'string' ||
        typeof fieldValueItem === 'number' ||
        typeof fieldValueItem === 'bigint' ||
        typeof fieldValueItem === 'symbol' ||
        typeof fieldValueItem === 'boolean'
      ) {
        const queryParamName = `${fieldAlias}_${i}`;
        queryTemplateParamNames += `:${queryParamName}, `;
        paramsForQuery[queryParamName] = fieldValueItem;
        continue;
      }
      if (fieldValueItem instanceof Date) {
        const queryParamName = `${fieldAlias}_${i}`;
        queryTemplateParamNames += `:${queryParamName}, `;
        paramsForQuery[queryParamName] = fieldValueItem.valueOf();
        continue;
      }
      if (isSimple) {
        isSimple = false;
        break;
      }
    }
    return { hasValues, isSimple, paramsForQuery, queryTemplateParamNames };
  }

  /*
   * This method is a tid bit complex, so it requires a proper explanation. The idea is that you can pass a deeply nested filters object (example below)
   * and receive back two objects - a 'where' object containg the where clause partials and their paramters, ready to be fed to the query builder,
   * and an 'include' object, containing the relations that need to be joined for the parsed where clause partials, provided there are any. This effectively
   * enables search by deeply nested fields, for example relatedEntity.deepRelatedEntity.deeperRelatedEntity.field = 'test'.
   * For further low-level details, check these issues: https://github.com/typeorm/typeorm/issues/2707, https://github.com/typeorm/typeorm/issues/3890
   * Example object:
   * {
   *   field0: null,
   *   field1: { $not: null },
   *   field2: { $not: [ 1, new Date(), 2, null, 3, true, 'test' ] },
   *   field3: [ 1, 2, 3 ],
   *   field4: 10,
   *   field5: 'test',
   *   field6: false,
   *   field7: new Date(),
   *   field8: [ 1, new Date(), 2, null, 3, true, 'test' ],
   *   field9: { $like: '%test%' },
   *   entityName.innerEntityName.field10: { $between: [ 10, 20 ] },
   *   field11: { $or: [ { $not: null }, 20, [ false, { $ilike: '%test' } ] ] },
   *   field12: undefined,
   *   $or: { ... }
   * }
   */
  parseFilters(
    entityName: string,
    filters: GenericObject,
    options: {
      fieldAliases?: { [fieldName: string]: string };
      isTopLevel: boolean;
      operator?: PersistanceSelectOperator;
    } = { isTopLevel: true }
  ): {
    where: { [fieldName: string]: ParsedFilter };
    include: IncludeItems;
  } {
    const cqs = this.columnQuotesSymbol;
    const { isTopLevel, operator } = options;
    const fieldAliases = options.fieldAliases || {};
    const where: { [fieldName: string]: ParsedFilter } = {};
    let include: IncludeItems = {};
    for (const fieldName in filters) {
      const fieldValue = filters[fieldName];
      if (typeof fieldValue === 'undefined') {
        continue;
      }
      const fieldAlias = fieldAliases[fieldName] || fieldName;
      const isNot = operator === PersistanceSelectOperator.Not;
      // handle relation fields
      if (fieldName.match(/\./)) {
        const fieldData = fieldName.split('.');
        const finalItemIndex = fieldData.length - 1;
        const actualFieldName = fieldData[finalItemIndex];
        let entityAlias = `${entityName}`;
        let previousEntityAlias = `${entityName}`;
        for (let i = 0; i < finalItemIndex; i++) {
          const currentEntityName = fieldData[i];
          entityAlias += `_${currentEntityName}`;
          include[`${previousEntityAlias}.${currentEntityName}`] = entityAlias;
          previousEntityAlias = `${entityAlias}`;
        }
        const itemData = this.parseFilters(
          entityAlias,
          { [actualFieldName]: fieldValue },
          {
            fieldAliases: { [actualFieldName]: fieldAlias },
            isTopLevel: false,
            operator
          }
        );
        where[fieldName] = itemData.where[actualFieldName];
        include = { ...include, ...itemData.include };
        continue;
      }
      if (fieldValue === null) {
        where[fieldName] = {
          query: `${cqs}${entityName}${cqs}.${cqs}${fieldName}${cqs} is${isNot ? ' not ' : ' '}null`
        };
        continue;
      }
      // handle array values
      if (fieldValue instanceof Array) {
        // if all values are primitive types and/or dates, then use 'between' (if provided) or 'in'
        const { hasValues, isSimple, paramsForQuery, queryTemplateParamNames } = this.parseArrayOfFilters(
          fieldValue,
          fieldAlias
        );
        if (!hasValues) {
          continue;
        }
        if (isSimple) {
          if (operator === PersistanceSelectOperator.Between) {
            where[fieldName] = {
              params: paramsForQuery,
              query:
                `${cqs}${entityName}${cqs}.${cqs}${fieldName}${cqs}${isNot ? ' not ' : ' '}` +
                `between :${fieldAlias}_0 and :${fieldAlias}_1`
            };
            continue;
          }
          where[fieldName] = {
            params: paramsForQuery,
            query:
              `${cqs}${entityName}${cqs}.${cqs}${fieldName}${cqs}${isNot ? ' not ' : ' '}` +
              `in (${queryTemplateParamNames.replace(/,\s$/, '')})`
          };
          continue;
        }
        // otherwise, go through the array's items recursively and build the query
        if (isTopLevel && fieldName === PersistanceSelectOperator.Or) {
          const finalWhereValue = { params: {}, query: '' };
          fieldValue.forEach((orFieldValue, orFieldIndex) => {
            const itemData = this.parseInnerFilters(
              entityName,
              orFieldValue,
              fieldName,
              `${fieldAlias}_${orFieldIndex}_f`,
              operator
            );
            finalWhereValue.params = { ...finalWhereValue.params, ...(itemData.parsedFilter.params || {}) };
            finalWhereValue.query += `${finalWhereValue.query.length ? ' or ' : '('}${itemData.parsedFilter.query}`;
            include = { ...include, ...itemData.include };
          });
          finalWhereValue.query += ')';
          where[fieldName] = finalWhereValue;
        } else {
          const itemData = this.parseInnerFilters(
            entityName,
            fieldValue as unknown as GenericObject,
            fieldName,
            fieldAlias,
            operator
          );
          if (itemData.parsedFilter.query === '()') {
            continue;
          }
          where[fieldName] = itemData.parsedFilter;
          include = { ...include, ...itemData.include };
        }
        continue;
      }
      // handle non-date object values - go through the object's values recursively and build the query
      if (typeof fieldValue === 'object' && !(fieldValue instanceof Date)) {
        const itemData = this.parseInnerFilters(
          entityName,
          fieldValue as unknown as GenericObject,
          fieldName,
          fieldAlias,
          operator
        );
        where[fieldName] = itemData.parsedFilter;
        include = { ...include, ...itemData.include };
        continue;
      }
      // handle the rest of the allowed operators and the $not operator, where applicable
      where[fieldName] = this.getValueForFilter(entityName, fieldName, fieldAlias, fieldValue, isNot, operator);
    }
    return { where, include };
  }

  parseInnerFilters(
    entityName: string,
    filtersObject: GenericObject,
    fieldName: string,
    fieldAlias: string,
    operator?: PersistanceSelectOperator
  ): { parsedFilter: ParsedFilter; include: IncludeItems } {
    const itemsCount = filtersObject instanceof Array ? filtersObject.length : Object.keys(filtersObject).length;
    const hasBrackets = itemsCount > 1;
    const parsedFilterItem = { params: {}, query: '' };
    let parsedValueCount = 0;
    let include = {};
    for (const key in filtersObject) {
      let op = null;
      if (this.allowedStringOperators.indexOf(key) !== -1) {
        op = key;
      }
      const actualFieldName = fieldName === PersistanceSelectOperator.Or ? key : fieldName;
      const innerValue = filtersObject[key];
      const itemData = this.parseFilters(
        entityName,
        { [actualFieldName]: innerValue },
        {
          fieldAliases: { [actualFieldName]: `${fieldAlias}_${parsedValueCount}` },
          isTopLevel: false,
          operator: op as PersistanceSelectOperator
        }
      );
      const fieldWhereData = itemData.where[actualFieldName];
      if (!fieldWhereData) {
        continue;
      }
      const innerQuery = itemData.where[actualFieldName].query;
      parsedFilterItem.params = { ...parsedFilterItem.params, ...(fieldWhereData.params || {}) };
      parsedFilterItem.query +=
        (parsedValueCount > 0 ? (operator === PersistanceSelectOperator.Or ? ' or ' : ' and ') : '') +
        (hasBrackets ? `(${innerQuery})` : innerQuery);
      include = { ...include, ...itemData.include };
      parsedValueCount++;
    }
    return { parsedFilter: parsedFilterItem, include };
  }

  parseRelations(entityName: string, include: string[], currentInclude?: IncludeItems): IncludeItems {
    const resultInclude: IncludeItems = { ...(currentInclude || {}) };
    include.forEach(includeItem => {
      const includeData = includeItem.split('.');
      let entityAlias = `${entityName}`;
      let previousEntityAlias = `${entityName}`;
      includeData.forEach(currentEntityName => {
        entityAlias += `_${currentEntityName}`;
        resultInclude[`${previousEntityAlias}.${currentEntityName}`] = entityAlias;
        previousEntityAlias = `${entityAlias}`;
      });
    });
    return resultInclude;
  }

  parseOrderBy(
    entityName: string,
    orderByData: GenericObject<PersistanceOrderByDirection>
  ): { include: IncludeItems; orderBy: PersistanceOrderBy[] } {
    const orderBy: PersistanceOrderBy[] = [];
    let include: IncludeItems = {};
    for (const fieldName in orderByData) {
      const direction =
        orderByData[fieldName].toLowerCase() === 'desc'
          ? PersistanceOrderByDirection.Desc
          : PersistanceOrderByDirection.Asc;
      const item: PersistanceOrderBy = { field: `${entityName}.${fieldName}`, direction };
      // handle relation fields
      if (fieldName.match(/\./)) {
        const fieldData = fieldName.split('.');
        const finalItemIndex = fieldData.length - 1;
        let entityAlias = `${entityName}`;
        let previousEntityAlias = `${entityName}`;
        for (let i = 0; i < finalItemIndex; i++) {
          const currentEntityName = fieldData[i];
          entityAlias += `_${currentEntityName}`;
          include[`${previousEntityAlias}.${currentEntityName}`] = entityAlias;
          previousEntityAlias = `${entityAlias}`;
        }
        include = { ...include };
        item.field = `${previousEntityAlias}.${fieldData[finalItemIndex]}`;
      }
      orderBy.push(item);
    }
    return {
      include,
      orderBy
    };
  }

  parseSelect(selectFields: string[], include?: IncludeItems): string[] {
    const actualInclude = include || {};
    const parsedSelect: string[] = [];
    selectFields.forEach(item => {
      const itemData = item.split('.');
      if (itemData.length === 1) {
        parsedSelect.push(item);
        return;
      }
      const fieldName = itemData.pop();
      const entityAlias = actualInclude[itemData.join('.')];
      if (!entityAlias) {
        return;
      }
      parsedSelect.push(`${entityAlias}.${fieldName}`);
    });
    return parsedSelect;
  }
}
