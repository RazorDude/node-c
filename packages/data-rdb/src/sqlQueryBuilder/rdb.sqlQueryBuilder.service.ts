import { Inject, Injectable } from '@nestjs/common';

import {
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants,
  DataOrderBy,
  DataOrderByDirection,
  DataSelectOperator,
  GenericObject,
  LoggerService,
  RDBType
} from '@node-c/core';

import ld from 'lodash';

import { Constants } from '../common/definitions/common.constants.js';
import {
  OrmBaseQueryBuilder,
  OrmSelectQueryBuilder
} from '../ormQueryBuilder/rdb.ormQueryBuilder.js';
import { RDBEntityManager } from '../repository/rdb.repository.js';

import {
  BuildQueryOptions,
  IncludeItems,
  ParsedFilter
} from './rdb.sqlQueryBuilder.definitions.js';

const regExps = {
  commaSpace: new RegExp(/,\s$/u),
  dollarSign: new RegExp(/\$/u),
  dot: new RegExp(/\./u)
};

@Injectable()
export class SQLQueryBuilderService {
  allowedOperatorsUnderNot: Record<string, boolean> = {
    [DataSelectOperator.Between]: true,
    [DataSelectOperator.Contains]: true,
    [DataSelectOperator.GreaterThan]: true,
    [DataSelectOperator.GreaterThanOrEqual]: true,
    [DataSelectOperator.ILike]: true,
    [DataSelectOperator.LessThan]: true,
    [DataSelectOperator.LessThanOrEqual]: true,
    [DataSelectOperator.Like]: true
  };
  allowedStringOperators: string[] = Object.values(DataSelectOperator);
  columnQuotesSymbol: string;
  dbType: RDBType | string;
  iLikeSupported: boolean;
  returningSupported: boolean;

  constructor(
    public configProvider: ConfigProviderService,
    @Inject(Constants.SQL_BUILDER_DB_CONFIG_PATH)
    public dbConfigPath: string,
    @Inject(CoreConstants.DATA_MODULE_NAME)
    public dataModuleName: string,
    public logger: LoggerService
  ) {
    const { type } = ld.get(configProvider, dbConfigPath) as { type: RDBType };
    this.dbType = type;
    if (
      type === RDBType.Aurora ||
      type === RDBType.ClickHouse ||
      type === RDBType.MySQL
    ) {
      this.columnQuotesSymbol = '`';
      this.iLikeSupported = false;
      this.returningSupported = false;
    } else if (type === RDBType.PG) {
      this.columnQuotesSymbol = '"';
      this.iLikeSupported = true;
      this.returningSupported = true;
    }
  }

  // TODO: relation crawling functionality for deletedAt
  // TODO: relation crawling functionality for primary & join keys for related data
  buildQuery<Entity>(
    ormQueryBuilder:
      | OrmBaseQueryBuilder<Entity>
      | OrmSelectQueryBuilder<Entity>,
    options: BuildQueryOptions
  ): void {
    const {
      currentEntityName,
      deletedColumnName,
      entityManager,
      where: optWhere,
      include,
      orderBy,
      select,
      throwErrorOnForbiddenInclude,
      withDeleted,
      withDeletedPerRelation
    } = options;
    const cqs = this.columnQuotesSymbol;
    const where = { ...(optWhere || {}) };
    if ('withDeleted' in ormQueryBuilder) {
      const oqb = ormQueryBuilder as OrmSelectQueryBuilder<Entity>;
      if (withDeleted) {
        oqb.withDeleted();
      }
      if (include) {
        for (const relationProperty in include) {
          if (ld.get(withDeletedPerRelation || {}, relationProperty)) {
            oqb.leftJoinAndSelect(relationProperty, include[relationProperty]);
          } else {
            const relationDeletedColumnName = this.getDeletedAtColumnForEntity({
              currentEntityName,
              entityManager,
              entityPath: include[relationProperty]
            });
            if (relationDeletedColumnName) {
              oqb.leftJoinAndSelect(
                relationProperty,
                include[relationProperty],
                `${cqs}${include[relationProperty]}${cqs}.${cqs}${relationDeletedColumnName}${cqs} IS NULL`
              );
            } else {
              oqb.leftJoinAndSelect(
                relationProperty,
                include[relationProperty]
              );
            }
          }
        }
      }
      if (select?.length) {
        oqb.select(
          this.parseSelect(currentEntityName, select, {
            include,
            throwErrorOnForbiddenInclude
          })
        );
      }
    } else if (withDeleted === false && deletedColumnName) {
      where[deletedColumnName] = {
        query: `${cqs}${deletedColumnName}${cqs} IS NULL`
      };
    }
    if (Object.keys(where).length > 0) {
      let isFirst = true;
      for (const fieldName in where) {
        const whereItem = where[fieldName];
        if (whereItem.query.length === 0) {
          continue;
        }
        let methodName = 'where';
        if (isFirst) {
          isFirst = false;
        } else {
          methodName = 'andWhere';
        }
        (
          ormQueryBuilder as unknown as {
            [oqbMethodName: string]: (..._args: unknown[]) => void;
          }
        )[methodName](`(${whereItem.query})`, whereItem.params);
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

  getDeletedAtColumnForEntity(options: {
    currentEntityName: string;
    entityManager: RDBEntityManager;
    entityPath: string;
  }): string | undefined {
    const { currentEntityName, entityManager } = options;
    const entityPath = options.entityPath.split('.');
    let currentEntity = entityManager.getRepository(currentEntityName);
    let deletedAtColumnName: string | undefined;
    for (const i in entityPath) {
      const { relations } = currentEntity.metadata;
      if (!relations) {
        break;
      }
      const entityPathItem = entityPath[i];
      const relationPathItem = relations.find(
        (relationItem) => relationItem.propertyName === entityPathItem
      );
      if (!relationPathItem) {
        break;
      }
      currentEntity = entityManager.getRepository(relationPathItem.type);
    }
    if (
      currentEntity.target !== currentEntityName &&
      currentEntity.metadata.deleteDateColumn
    ) {
      deletedAtColumnName =
        currentEntity.metadata.deleteDateColumn.databaseName;
    }
    return deletedAtColumnName;
  }

  protected getValueForFilter(options: {
    entityName: string;
    fieldAlias: string;
    fieldName: string;
    fieldUniqueIteration: number;
    fieldValue: unknown;
    isNot?: boolean;
    operator?: DataSelectOperator;
  }): ParsedFilter {
    const { columnQuotesSymbol: cqs, dbType } = this;
    const {
      entityName,
      fieldAlias,
      fieldName,
      fieldUniqueIteration,
      fieldValue,
      isNot,
      operator
    } = options;
    const escapedFieldName = fieldName.replace(regExps.dollarSign, '__ds__');
    const fieldString = `${cqs}${entityName}${cqs}.${cqs}${escapedFieldName}${cqs}`;
    const paramName = `${entityName}___${fieldAlias.replace(regExps.dollarSign, '__ds__')}_${fieldUniqueIteration}`;
    let parsedInnerValue =
      fieldValue instanceof Date ? fieldValue.valueOf() : fieldValue;
    if (operator === DataSelectOperator.Contains) {
      let query = '';
      // TODO: fix JSON_CONTAINS here for ClickHouse
      if (
        dbType === RDBType.Aurora ||
        dbType === RDBType.ClickHouse ||
        dbType === RDBType.MySQL
      ) {
        query = `${isNot ? 'not ' : ''}JSON_CONTAINS(${fieldString}, :${paramName})`;
        parsedInnerValue = `"${parsedInnerValue}"`;
      } else if (dbType === RDBType.PG) {
        query = `${isNot ? 'not ' : ''}(${fieldString} ? :${paramName})`;
      }
      return {
        params: { [paramName]: parsedInnerValue },
        query
      };
    }
    if (operator === DataSelectOperator.GreaterThan) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString} ${isNot ? '<=' : '>'} :${paramName}`
      };
    }
    if (operator === DataSelectOperator.GreaterThanOrEqual) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString} ${isNot ? '<' : '>='} :${paramName}`
      };
    }
    if (operator === DataSelectOperator.LessThan) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString} ${isNot ? '>=' : '<'} :${paramName}`
      };
    }
    if (operator === DataSelectOperator.LessThanOrEqual) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString} ${isNot ? '>' : '<='} :${paramName}`
      };
    }
    if (
      operator === DataSelectOperator.Like ||
      (operator === DataSelectOperator.ILike && !this.iLikeSupported)
    ) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString}${isNot ? ' not ' : ' '}like :${paramName}`
      };
    }
    if (operator === DataSelectOperator.ILike) {
      return {
        params: { [paramName]: parsedInnerValue },
        query: `${fieldString}${isNot ? ' not ' : ' '}ilike :${paramName}`
      };
    }
    return {
      params: { [paramName]: parsedInnerValue },
      query: `${fieldString} ${isNot ? '!=' : '='} :${paramName}`
    };
  }

  protected parseArrayOfFilters(
    filtersArray: unknown,
    fieldAlias: string
  ): {
    hasNullValues?: boolean;
    isArray?: boolean;
    isSimple?: boolean;
    paramsCount?: number;
    paramsForQuery?: GenericObject;
    queryTemplateParamNames?: string;
  } {
    if (!Array.isArray(filtersArray)) {
      return { isArray: false };
    }
    let hasNullValues = false;
    let isSimple = true;
    let paramsCount = 0;
    const paramsForQuery: GenericObject = {};
    let queryTemplateParamNames = '';
    for (const i in filtersArray) {
      const fieldValueItem = filtersArray[i];
      if (typeof fieldValueItem === 'undefined') {
        continue;
      }
      if (
        fieldValueItem === null ||
        typeof fieldValueItem === 'string' ||
        typeof fieldValueItem === 'number' ||
        typeof fieldValueItem === 'bigint' ||
        typeof fieldValueItem === 'symbol' ||
        typeof fieldValueItem === 'boolean'
      ) {
        // inefficient recheck, but reasonable code quality
        if (fieldValueItem === null && !hasNullValues) {
          hasNullValues = true;
        }
        const queryParamName = `${fieldAlias}_${i}`;
        queryTemplateParamNames += `:${queryParamName}, `;
        paramsCount++;
        paramsForQuery[queryParamName] = fieldValueItem;
        continue;
      }
      if (fieldValueItem instanceof Date) {
        const queryParamName = `${fieldAlias}_${i}`;
        queryTemplateParamNames += `:${queryParamName}, `;
        paramsCount++;
        paramsForQuery[queryParamName] = fieldValueItem.valueOf();
        continue;
      }
      if (isSimple) {
        isSimple = false;
        break;
      }
    }
    return {
      hasNullValues,
      isArray: true,
      isSimple,
      paramsCount,
      paramsForQuery,
      queryTemplateParamNames
    };
  }

  // TODO: fieldAliases for relations' fields
  /**
   * This method is a tid bit complex, so it requires a proper explanation.
   *
   * The idea is that you can pass a deeply nested filters object (example below) and receive back two objects:
   *
   * - a 'where' object containg the where clause partials and their paramters, ready to be fed to the query builder, and
   *
   * - an 'include' object, containing the relations that need to be joined for the parsed where clause partials, provided there are any.
   *
   * This effectively enables search by deeply nested fields, for example relatedEntity.deepRelatedEntity.deeperRelatedEntity.field = 'test'.
   *
   * It also allows for two-tiered nested combinations of filters with $not. Specifically, the allowed ones are:
   *
   * - $not -> $like/$ilike
   *
   * - $not -> $between
   *
   * - $not -> $gt/$gte/$lt/$lte
   *
   * - $not -> $contains
   *
   * - $not -> [] directly, where the array contains atomic values and is treated as the $in operator.
   *
   * For further low-level details on how it started, I had to work around these TypeOrm issues: https://github.com/typeorm/typeorm/issues/2707, https://github.com/typeorm/typeorm/issues/3890
   *
   * Note: The $contains operator checks whether a JSON column contains a given string value.
   *
   * Example object:
   *
   * {
   *   field0: null,
   *
   *   field1: { $not: null },
   *
   *   field2: { $and: [{ $not: [ 1, new Date(), 2, 3, true, 'test' ] }, { $not: null }] },
   *
   *   field3: [ 1, 2, 3 ],
   *
   *   field4: 10,
   *
   *   field5: 'test',
   *
   *   field6: false,
   *
   *   field7: new Date(),
   *
   *   field8: [ 1, new Date(), 2, 3, true, 'test' ],
   *
   *   field9: { $like: '%test%' },
   *
   *   entityName.innerEntityName.field10: { $between: [ 10, 20 ] },
   *
   *   entityName.innerEntityName.field11: { $not: { $between: [ 10, 20 ] } },
   *
   *   field12: { $or: [ { $not: null }, 20, [ false, { $ilike: '%test' } ] ] },
   *
   *   field13: { $not: { $like: '%test%' } },
   *
   *   field14: { $contains: 'test' },
   *
   *   field15: { $not: { $contains: 'test' } },
   *
   *   field16: undefined,
   *
   *   $and: { ...all-of-the-above },
   *
   *   $or: { ...all-of-the-above }
   *
   * }
   */
  parseFilters(
    entityName: string,
    filters: GenericObject,
    options: {
      currentDepth?: number;
      fieldAliases?: { [fieldName: string]: string };
      fieldUniqueIteration?: number;
      isNot?: boolean;
      maxDepth?: number;
      operator?: DataSelectOperator;
      parameterNamesToFieldAliasesMap?: { [fieldName: string]: string };
    } = {}
  ): {
    fieldUniqueIteration: number;
    include: IncludeItems;
    where: { [fieldName: string]: ParsedFilter };
  } {
    const cqs = this.columnQuotesSymbol;
    const { currentDepth = 0, isNot, maxDepth = 10, operator } = options;
    const fieldAliases = options.fieldAliases || {};
    const parameterNamesToFieldAliasesMap =
      options.parameterNamesToFieldAliasesMap || {};
    const where: { [fieldName: string]: ParsedFilter } = {};
    let fieldUniqueIteration = Number(options.fieldUniqueIteration ?? -1);
    let include: IncludeItems = {};
    if (currentDepth > maxDepth) {
      throw new ApplicationError(
        `[SQLQueryBuilderService][${entityName}]: Max depth of ${maxDepth} exceeded.`
      );
    }
    for (const fieldName in filters) {
      const fieldValue = filters[fieldName];
      // skip undefined filter values
      if (typeof fieldValue === 'undefined') {
        continue;
      }
      let fieldAlias = fieldAliases[fieldName];
      fieldUniqueIteration++;
      // handle relation fields
      if (fieldName.match(regExps.dot)) {
        const fieldData = fieldName.split('.');
        const finalItemIndex = fieldData.length - 1;
        const actualFieldName = fieldData[finalItemIndex];
        let entityAlias = `${entityName}`;
        let previousEntityAlias = `${entityName}`;
        for (let i = 0; i < finalItemIndex; i++) {
          const currentEntityName = fieldData[i];
          entityAlias += `__${currentEntityName}`;
          include[`${previousEntityAlias}.${currentEntityName}`] = entityAlias;
          previousEntityAlias = `${entityAlias}`;
        }
        if (!fieldAlias) {
          fieldAlias = actualFieldName;
        }
        const actualFieldAlias =
          parameterNamesToFieldAliasesMap[fieldAlias] || fieldAlias;
        const itemData = this.parseFilters(
          entityAlias,
          { [actualFieldName]: fieldValue },
          {
            currentDepth,
            fieldAliases: {
              [actualFieldName]: actualFieldAlias
            },
            fieldUniqueIteration,
            maxDepth,
            operator
          }
        );
        where[fieldName] = itemData.where[actualFieldName];
        include = { ...include, ...itemData.include };
        fieldUniqueIteration = itemData.fieldUniqueIteration + 1;
        continue;
      }
      if (!fieldAlias) {
        fieldAlias = fieldName;
      }
      const actualFieldAlias =
        parameterNamesToFieldAliasesMap[fieldAlias] || fieldAlias;
      // handle a direct new value
      if (fieldValue === null) {
        // Note to self: we're using the real column here, rather than appending it to the field alias,
        // since it's a direct query without any parameters.
        where[fieldName] = {
          query: `${cqs}${entityName}${cqs}.${cqs}${actualFieldAlias}${cqs} is${isNot ? ' not ' : ' '}null`
        };
        continue;
      }
      const arrayParamNameBase = `${entityName}___${actualFieldAlias}_${fieldUniqueIteration}`;
      const arrayData = this.parseArrayOfFilters(
        fieldValue,
        arrayParamNameBase
      );
      if (arrayData.isArray && arrayData.isSimple && !arrayData.paramsCount) {
        continue;
      }
      // If all values are primitive types and/or dates, then use 'between' (if provided) or 'in'.
      // This is also combined with the potential $not operator, passed from the parent iteration.
      if (arrayData.isSimple) {
        if (arrayData.hasNullValues) {
          throw new ApplicationError(
            `[SQLQueryBuilderService][${entityName}]: Invalid simple array filter on field ${fieldName} ` +
              ` (alias: ${actualFieldAlias}) - cannot contain null values.`
          );
        }
        if (operator === DataSelectOperator.Between) {
          if (arrayData.paramsCount !== 2) {
            throw new ApplicationError(
              `[SQLQueryBuilderService][${entityName}]: Invalid params count ${arrayData.paramsCount} for ` +
                `$between filter on field ${fieldName} (alias: ${actualFieldAlias}).`
            );
          }
          where[fieldName] = {
            params: arrayData.paramsForQuery,
            query:
              `${cqs}${entityName}${cqs}.${cqs}${actualFieldAlias}${cqs}${isNot ? ' not ' : ' '}` +
              `between :${arrayParamNameBase}_0 and :${arrayParamNameBase}_1`
          };
          fieldUniqueIteration++;
          continue;
        }
        // $or with a simple array is the same as $in
        if (operator && operator !== DataSelectOperator.Or) {
          throw new ApplicationError(
            `[SQLQueryBuilderService][${entityName}]: Invalid operator ${operator} filter on field ${fieldName} ` +
              `(alias: ${actualFieldAlias}) - ${isNot ? '$not ' : ''}$in operator already active.`
          );
        }
        where[fieldName] = {
          params: arrayData.paramsForQuery,
          query:
            `${cqs}${entityName}${cqs}.${cqs}${actualFieldAlias}${cqs}${isNot ? ' not ' : ' '}` +
            `in (${arrayData.queryTemplateParamNames!.replace(regExps.commaSpace, '')})`
        };
        fieldUniqueIteration++;
        continue;
      }
      // Nested array and non-date object values - go through the object's values recursively and build the query.
      // The parent operator is intentionally not passed here, since it's not relevant for the child query.
      if (typeof fieldValue === 'object' && !(fieldValue instanceof Date)) {
        const itemData = this.parseInnerFilters(
          fieldValue as unknown as GenericObject,
          {
            currentDepth,
            entityName,
            fieldAlias: actualFieldAlias,
            fieldAliases,
            fieldName,
            fieldUniqueIteration,
            isNot,
            maxDepth
          }
        );
        if (
          itemData.parsedFilter.query === '' ||
          itemData.parsedFilter.query === '()'
        ) {
          continue;
        }
        where[fieldName] = itemData.parsedFilter;
        include = { ...include, ...itemData.include };
        fieldUniqueIteration = itemData.fieldUniqueIteration + 1;
        continue;
      }
      // Handle the rest of the allowed operators and the $not operator, where applicable.
      where[fieldName] = this.getValueForFilter({
        entityName,
        fieldAlias,
        fieldName: actualFieldAlias,
        fieldUniqueIteration,
        fieldValue,
        isNot,
        operator
      });
      fieldUniqueIteration++;
    }
    return { fieldUniqueIteration, include, where };
  }

  protected parseInnerFilters(
    filtersObject: GenericObject,
    options: {
      currentDepth: number;
      entityName: string;
      fieldAlias: string;
      fieldAliases: GenericObject<string>;
      fieldName: string;
      fieldUniqueIteration: number;
      isNot?: boolean;
      maxDepth: number;
    }
  ): {
    fieldUniqueIteration: number;
    parsedFilter: ParsedFilter;
    include: IncludeItems;
  } {
    const {
      currentDepth,
      entityName,
      fieldAlias,
      fieldAliases,
      fieldName,
      maxDepth
    } = options;
    const isOperator = this.allowedStringOperators.indexOf(fieldName) !== -1;
    let isGroup = false;
    let isNot = false;
    let isOr = false;
    if (isOperator) {
      if (fieldName === DataSelectOperator.Not) {
        isNot = true;
      } else if (fieldName === DataSelectOperator.Or) {
        isGroup = true;
        isOr = true;
      } else if (fieldName === DataSelectOperator.And) {
        isGroup = true;
      } else {
        throw new ApplicationError(
          `[SQLQueryBuilderService][${entityName}]: Invalid nesting under operator ${fieldName}: ` +
            'only $and, $or and $not can contain nested filters.'
        );
      }
    } else if (Array.isArray(filtersObject)) {
      // Arrays match any of their items, the same way simple arrays are treated as $in.
      // When negated, the items are joined with 'and' instead, since NOT (a OR b) is (NOT a) AND (NOT b).
      isOr = !options.isNot;
    }
    const parsedFilterItem = { params: {}, query: '' };
    let fieldUniqueIteration = Number(options.fieldUniqueIteration);
    let parsedValueCount = 0;
    let include = {};
    for (const key in filtersObject) {
      let innerOperator: string | null = null;
      if (this.allowedStringOperators.indexOf(key) !== -1) {
        innerOperator = key;
        if (isGroup) {
          throw new ApplicationError(
            `[SQLQueryBuilderService][${entityName}]: Invalid nested operators: ` +
              `${isOr ? '$or' : '$and'} + ${innerOperator}`
          );
        }
        if (
          (isNot || options.isNot) &&
          innerOperator === DataSelectOperator.Not
        ) {
          throw new ApplicationError(
            `[SQLQueryBuilderService][${entityName}]: Invalid nesting of $not under $not.`
          );
        }
        if (isNot && !this.allowedOperatorsUnderNot[innerOperator]) {
          throw new ApplicationError(
            `[SQLQueryBuilderService][${entityName}]: Invalid filter ${innerOperator} under $not: ` +
              'allowed values are $like, $ilike, $between, $gt, $gte, $lt, $lte and $contains.'
          );
        }
      }
      const actualFieldName = isGroup ? fieldAliases[key] || key : key;
      const fieldParameterName = `${key}_${parsedValueCount}`;
      const innerValue = filtersObject[key];
      const isFieldKey =
        innerOperator === null && !Array.isArray(filtersObject);
      const columnAlias = isFieldKey ? fieldAliases[key] || key : fieldAlias;
      // Relation keys (e.g. relatedEntity.field) are resolved by parseFilters itself, which uses the last segment
      // of the path as the column - setting an alias override here would turn the whole path into the column name.
      const isRelationKey = isFieldKey && regExps.dot.test(key);
      const itemData = this.parseFilters(
        entityName,
        { [actualFieldName]: innerValue },
        {
          currentDepth: currentDepth + 1,
          fieldAliases: isRelationKey
            ? fieldAliases
            : {
                ...fieldAliases,
                [actualFieldName]: fieldParameterName
              },
          fieldUniqueIteration,
          maxDepth,
          parameterNamesToFieldAliasesMap: isRelationKey
            ? {}
            : {
                [fieldParameterName]: columnAlias
              },
          ...(innerOperator === DataSelectOperator.Not
            ? { isNot: true }
            : {
                isNot: options.isNot,
                operator: innerOperator as DataSelectOperator
              })
        }
      );
      const fieldWhereData = itemData.where[actualFieldName];
      if (!fieldWhereData) {
        continue;
      }
      const innerQuery = itemData.where[actualFieldName].query;
      parsedFilterItem.params = {
        ...parsedFilterItem.params,
        ...(fieldWhereData.params || {})
      };
      if (parsedValueCount > 0) {
        parsedFilterItem.query += isOr ? ' or ' : ' and ';
      }
      parsedFilterItem.query += `(${innerQuery})`;
      include = { ...include, ...itemData.include };
      fieldUniqueIteration = itemData.fieldUniqueIteration + 1;
      parsedValueCount++;
    }
    return {
      fieldUniqueIteration,
      parsedFilter: parsedFilterItem,
      include
    };
  }

  parseRelations(
    entityName: string,
    data: {
      currentInclude?: IncludeItems;
      newIncludeItems?: IncludeItems;
      unparsedInclude?: string[];
    },
    options: {
      allowedInclude: string[];
      throwErrorOnForbiddenInclude?: boolean;
    }
  ): IncludeItems {
    const { allowedInclude, throwErrorOnForbiddenInclude } = options;
    const { currentInclude, newIncludeItems, unparsedInclude } = data;
    const allowedIncludeMap: GenericObject<boolean> = {};
    const resultInclude: IncludeItems = { ...(currentInclude || {}) };
    allowedInclude.forEach((allowedIncludeItem) => {
      let currentParent = '';
      allowedIncludeItem.split('.').forEach((innerItem) => {
        currentParent += `${currentParent.length > 0 ? '.' : ''}${innerItem}`;
        if (!allowedIncludeMap[currentParent]) {
          allowedIncludeMap[currentParent] = true;
        }
      });
    });
    if (newIncludeItems) {
      for (const includeItemPath in newIncludeItems) {
        const includeItemAlias = newIncludeItems[includeItemPath];
        if (
          !allowedIncludeMap[
            includeItemPath.replace(/__/gu, '.').replace(`${entityName}.`, '')
          ]
        ) {
          if (throwErrorOnForbiddenInclude) {
            throw new ApplicationError(
              `[SQLQueryBuilder][${entityName}]: Forbidden include item ${includeItemPath} (${includeItemAlias}).`
            );
          }
          continue;
        }
        resultInclude[includeItemPath] = includeItemAlias;
      }
    }
    if (unparsedInclude) {
      unparsedInclude.forEach((includeItem) => {
        if (!allowedIncludeMap[includeItem]) {
          if (throwErrorOnForbiddenInclude) {
            throw new ApplicationError(
              `[SQLQueryBuilder][${entityName}]: Forbidden include item ${includeItem}.`
            );
          }
          return;
        }
        const includeData = includeItem.split('.');
        let entityAlias = `${entityName}`;
        let previousEntityAlias = `${entityName}`;
        includeData.forEach((currentEntityName) => {
          entityAlias += `__${currentEntityName}`;
          resultInclude[`${previousEntityAlias}.${currentEntityName}`] =
            entityAlias;
          previousEntityAlias = `${entityAlias}`;
        });
      });
    }
    return resultInclude;
  }

  parseOrderBy(
    entityName: string,
    orderByData: GenericObject<DataOrderByDirection>
  ): { include: IncludeItems; orderBy: DataOrderBy[] } {
    const orderBy: DataOrderBy[] = [];
    let include: IncludeItems = {};
    for (const fieldName in orderByData) {
      const direction =
        orderByData[fieldName].toLowerCase() === 'desc'
          ? DataOrderByDirection.Desc
          : DataOrderByDirection.Asc;
      const item: DataOrderBy = {
        field: `${entityName}.${fieldName}`,
        direction
      };
      // handle relation fields
      if (fieldName.match(regExps.dot)) {
        const fieldData = fieldName.split('.');
        const finalItemIndex = fieldData.length - 1;
        let entityAlias = `${entityName}`;
        let previousEntityAlias = `${entityName}`;
        for (let i = 0; i < finalItemIndex; i++) {
          const currentEntityName = fieldData[i];
          entityAlias += `__${currentEntityName}`;
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

  parseSelect(
    entityName: string,
    selectFields: string[],
    options?: {
      include?: IncludeItems;
      throwErrorOnForbiddenInclude?: boolean;
    }
  ): string[] {
    const { include, throwErrorOnForbiddenInclude } = options || {};
    const actualInclude = include || {};
    const parsedSelect: string[] = [];
    selectFields.forEach((item) => {
      const itemData = item.split('.');
      if (itemData.length === 1) {
        parsedSelect.push(`${entityName}.${item}`);
        return;
      }
      const fieldName = itemData.pop();
      // the include keys are in the format parentAlias.relationName - e.g. course.lessons, course__lessons.lessonType
      const relationName = itemData.pop();
      let parentAlias = entityName;
      for (const i in itemData) {
        parentAlias += `__${itemData[i]}`;
      }
      const includeItemPath = `${parentAlias}.${relationName}`;
      const includeItemAlias = actualInclude[includeItemPath];
      if (!includeItemAlias) {
        if (throwErrorOnForbiddenInclude) {
          throw new ApplicationError(
            `[SQLQueryBuilder][${entityName}]: Forbidden include item ${includeItemPath}.`
          );
        }
        return;
      }
      parsedSelect.push(`${includeItemAlias}.${fieldName}`);
    });
    return parsedSelect;
  }
}
