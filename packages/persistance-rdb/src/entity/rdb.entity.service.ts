import {
  ApplicationError,
  ConfigProviderService,
  GenericObject,
  PersistanceDefaultData,
  PersistanceDeleteResult,
  PersistanceEntityService,
  PersistanceFindResults,
  PersistanceOrderBy,
  PersistanceRelationItem,
  PersistanceSelectOperator,
  PersistanceUpdateResult,
  ProcessObjectAllowedFieldsType
} from '@node-c/core';

import { RDBEntitySchema } from './rdb.entity.schema';
import {
  BulkCreateOptions,
  BulkCreatePrivateOptions,
  CountOptions,
  CountPrivateOptions,
  CreateOptions,
  CreatePrivateOptions,
  DeleteOptions,
  DeletePrivateOptions,
  FindOneOptions,
  FindOnePrivateOptions,
  FindOptions,
  FindPrivateOptions,
  PostgresErrorCode,
  ProcessManyToManyColumnSettingsItem,
  // ProcessRelationsDataOptions,
  UpdateOptions,
  UpdatePrivateOptions
} from './rdb.entity.service.definitions';

import { OrmUpdateQueryBuilderUpdateResult } from '../ormQueryBuilder';
import { RDBEntityManager, RDBRepository } from '../repository';
import { IncludeItems, ParsedFilter, SQLQueryBuilderService } from '../sqlQueryBuilder';

// TODO: support for the "select" options in find and findOne (a.k.a. which fields to return)
// TODO: enforce the above to be always set to the primary key for the count method
// TODO: support update of multiple items in the update method
export class RDBEntityService<
  Entity extends GenericObject<unknown>,
  Data extends PersistanceDefaultData<Entity> = PersistanceDefaultData<Entity>
> extends PersistanceEntityService<Entity> {
  protected columnAliases: Record<string, string>;
  protected columNames: string[];
  protected deletedColumnName?: string;
  protected primaryKeys: string[];

  constructor(
    protected configProvider: ConfigProviderService,
    protected qb: SQLQueryBuilderService,
    // eslint-disable-next-line no-unused-vars
    protected repository: RDBRepository<Entity>,
    protected schema: RDBEntitySchema
  ) {
    super(configProvider, qb.persistanceModuleName);
    const { columns } = schema.options;
    const primaryKeys: string[] = [];
    let deletedColumnName: string | undefined;
    this.columnAliases = {};
    this.columNames = [];
    for (const columnName in columns) {
      const { deleteDate, name, primary } = columns[columnName] || {};
      this.columNames.push(columnName);
      if (!deletedColumnName && deleteDate) {
        deletedColumnName = columnName;
      }
      if (name) {
        this.columnAliases[columnName] = name;
      }
      if (primary) {
        primaryKeys.push(columnName);
      }
    }
    this.deletedColumnName = deletedColumnName;
    this.primaryKeys = primaryKeys;
    // TODO: find out how to get the primary keys data for the related items
    // console.log('====>', this.repository.metadata?.deleteDateColumn);
  }

  protected buildPrimaryKeyWhereClause(data: Entity[]): { field: string; value: ParsedFilter } {
    const { primaryKeys, qb, repository } = this;
    const { columnQuotesSymbol: cqs } = qb;
    const tableName = repository.metadata.tableName;
    if (primaryKeys.length === 1) {
      const [primaryKey] = primaryKeys;
      return {
        field: primaryKey,
        value: {
          params: { [primaryKey]: data.map(item => item[primaryKey as keyof Entity]) },
          query: `${cqs}${tableName}${cqs}.${cqs}${primaryKey}${cqs} in :${primaryKey}`
        }
      };
    }
    const params: GenericObject<unknown> = {};
    const query: string[] = [];
    data.forEach((item, itemIndex) => {
      const innerQuery: string[] = [];
      primaryKeys.forEach(fieldName => {
        const primaryKeyName = `${fieldName}${itemIndex}`;
        params[primaryKeyName] = item[fieldName as keyof Entity];
        innerQuery.push(`${cqs}${tableName}${cqs}.${cqs}${fieldName}${cqs} = :${primaryKeyName}`);
      });
      query.push(`(${innerQuery.join(' and ')})`);
    });
    return { field: PersistanceSelectOperator.Or, value: { params, query: `(${query.join(' or ')})` } };
  }

  async bulkCreate(
    data: Data['BulkCreate'],
    options?: BulkCreateOptions,
    privateOptions?: BulkCreatePrivateOptions
  ): Promise<Entity[]> {
    const actualOptions = options || {};
    const actualPrivateOptions = privateOptions || {};
    const { forceTransaction, transactionManager } = actualOptions;
    const { processInputAllowedFieldsEnabled } = actualPrivateOptions;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.bulkCreate(data, { ...actualOptions, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<Entity[]>;
    }
    return await this.save(data instanceof Array ? data : [data], transactionManager, {
      processObjectAllowedFieldsEnabled: processInputAllowedFieldsEnabled
    });
  }

  async count(options: CountOptions, privateOptions?: CountPrivateOptions): Promise<number | undefined> {
    const { filters, forceTransaction, transactionManager, withDeleted = false } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.count({ ...options, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<number>;
    }
    const { allowCountWithoutFilters, processFiltersAllowedFieldsEnabled } = actualPrivateOptions;
    const entityName = this.repository.metadata.name;
    const tableName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters!, {
      allowedFields: this.columNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!allowCountWithoutFilters && !Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field for counting is required.');
    }
    const { where, include: includeFromFilters } = this.qb.parseFilters(tableName, parsedFilters, {
      fieldAliases: this.columnAliases
    });
    const include = this.qb.parseRelations(tableName, [], includeFromFilters);
    this.qb.buildQuery<Entity>(queryBuilder, {
      currentEntityName: this.getEntityTarget() as string,
      deletedColumnName: this.deletedColumnName,
      entityManager: this.repository.manager,
      include,
      where,
      withDeleted
    });
    return await queryBuilder.getCount();
  }

  async create(data: Data['Create'], options?: CreateOptions, privateOptions?: CreatePrivateOptions): Promise<Entity> {
    const actualOptions = options || {};
    const actualPrivateOptions = privateOptions || {};
    const { forceTransaction, transactionManager } = actualOptions;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.create(data, { ...actualOptions, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<Entity>;
    }
    const saveResult = (await this.save(data instanceof Array ? data[0] : data, transactionManager, {
      processObjectAllowedFieldsEnabled: actualPrivateOptions.processInputAllowedFieldsEnabled
    })) as Entity;
    // TODO: automatic processManyToMany
    return saveResult;
  }

  async delete(
    options: DeleteOptions,
    privateOptions?: DeletePrivateOptions
  ): Promise<PersistanceDeleteResult<Entity>> {
    const { filters, forceTransaction, returnOriginalItems, transactionManager, softDelete = true } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.delete({ ...options, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<PersistanceDeleteResult<Entity>>;
    }
    const { processFiltersAllowedFieldsEnabled } = actualPrivateOptions;
    const entityName = this.repository.metadata.name;
    const tableName = this.repository.metadata.tableName;
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    const deleteType = softDelete ? 'softDelete' : 'delete';
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName)[deleteType]();
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters, {
      allowedFields: this.columNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field for deletion is required.');
    }
    const { where: parsedWhere, include } = this.qb.parseFilters(tableName, parsedFilters, {
      fieldAliases: this.columnAliases
    });
    let where: { [fieldName: string]: ParsedFilter } = {};
    if (Object.keys(include).length || returnOriginalItems) {
      const findData = await this.find({ filters: parsedFilters, transactionManager });
      const { field, value } = this.buildPrimaryKeyWhereClause(findData.items);
      where[field] = value;
      dataToReturn.originalItems = findData.items;
    } else {
      where = parsedWhere;
    }
    this.qb.buildQuery<Entity>(queryBuilder, {
      currentEntityName: this.getEntityTarget() as string,
      deletedColumnName: this.deletedColumnName,
      entityManager: this.repository.manager,
      where
    });
    const result = await queryBuilder.execute();
    return { ...dataToReturn, count: typeof result.affected === 'number' ? result.affected : undefined };
  }

  async find(options: FindOptions, privateOptions?: FindPrivateOptions): Promise<PersistanceFindResults<Entity>> {
    const {
      filters,
      forceTransaction,
      getTotalCount = true,
      page: optPage,
      perPage: optPerPage,
      findAll: optFindAll,
      include: optRelations,
      orderBy: optOrderBy,
      transactionManager,
      withDeleted = false
    } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.find({ ...options, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<PersistanceFindResults<Entity>>;
    }
    const page = optPage ? parseInt(optPage as unknown as string, 10) : 1; // make sure it's truly a number - it could come as string from GET requests
    const perPage = optPerPage ? parseInt(optPerPage as unknown as string, 10) : 10; // same as above - must be a number
    const findAll = optFindAll === true || (optFindAll as unknown) === 'true';
    const findResults: PersistanceFindResults<Entity> = { page: 1, perPage: 0, items: [], more: false };
    const entityName = this.repository.metadata.name;
    const processedFilters = (await this.processObjectAllowedFields<GenericObject>(filters || {}, {
      allowedFields: this.columNames,
      isEnabled: actualPrivateOptions.processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    let where: { [fieldName: string]: ParsedFilter } = {};
    let include: IncludeItems = {};
    let orderBy: PersistanceOrderBy[] = [];
    if (Object.keys(processedFilters).length) {
      const parsedFiltersData = this.qb.parseFilters(entityName, processedFilters, {
        fieldAliases: this.columnAliases
      });
      where = { ...parsedFiltersData.where };
      include = { ...parsedFiltersData.include };
    }
    include = this.qb.parseRelations(entityName, optRelations || [], include);
    if (optOrderBy) {
      const parsedOrderByData = this.qb.parseOrderBy(entityName, optOrderBy);
      include = { ...parsedOrderByData.include, ...include };
      orderBy = [...parsedOrderByData.orderBy];
    }
    this.qb.buildQuery<Entity>(queryBuilder, {
      currentEntityName: this.getEntityTarget() as string,
      deletedColumnName: this.deletedColumnName,
      entityManager: this.repository.manager,
      include,
      orderBy,
      select: options.select,
      where,
      withDeleted
    });
    if (!findAll) {
      queryBuilder.skip((page - 1) * perPage).take(perPage + 1);
      findResults.page = page;
      findResults.perPage = perPage;
    }
    const items: Entity[] = await queryBuilder.getMany();
    if (findAll) {
      findResults.perPage = items.length;
    } else {
      if (items.length === perPage + 1) {
        items.pop();
        findResults.more = true;
      }
      if (getTotalCount) {
        findResults.totalCount = await this.count(
          { ...options, filters: processedFilters },
          { allowCountWithoutFilters: true }
        );
      }
    }
    findResults.items = items;
    return findResults;
  }

  // TODO: requirePrimaryKeys
  async findOne(options: FindOneOptions, privateOptions?: FindOnePrivateOptions): Promise<Entity | null> {
    const {
      filters,
      forceTransaction,
      transactionManager,
      selectOperator,
      include: optRelations,
      orderBy: optOrderBy,
      withDeleted = false
    } = options;
    const actualPrivateOptions = privateOptions || {};
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.findOne({ ...options, transactionManager: tm }, actualPrivateOptions);
      }) as Promise<Entity | null>;
    }
    const entityName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    const parsedFilters = (await this.processObjectAllowedFields<GenericObject>(filters, {
      allowedFields: this.columNames,
      isEnabled: actualPrivateOptions.processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(parsedFilters).length) {
      throw new ApplicationError('At least one filter field is required for the findOne method.');
    }
    const { where, include: includeFromFilters } = this.qb.parseFilters(entityName, parsedFilters, {
      fieldAliases: this.columnAliases,
      operator: selectOperator as PersistanceSelectOperator
    });
    const include = this.qb.parseRelations(entityName, optRelations || [], includeFromFilters);
    let orderBy: PersistanceOrderBy[] = [];
    if (optOrderBy) {
      const parsedOrderByData = this.qb.parseOrderBy(entityName, optOrderBy);
      orderBy = [...parsedOrderByData.orderBy];
    }
    this.qb.buildQuery<Entity>(queryBuilder, {
      currentEntityName: this.getEntityTarget() as string,
      deletedColumnName: this.deletedColumnName,
      entityManager: this.repository.manager,
      include,
      orderBy,
      select: options.select,
      where,
      withDeleted
    });
    return await queryBuilder.getOne();
  }

  getEntityTarget(): unknown {
    return this.repository.target;
  }

  protected getRepository(transactionManager?: RDBEntityManager): RDBRepository<Entity> {
    if (transactionManager) {
      return transactionManager.getRepository<Entity>(this.repository.target);
    }
    return this.repository;
  }

  protected async processManyToMany<RelationItemsData>(
    data: {
      counterpartColumns: ProcessManyToManyColumnSettingsItem[];
      currentEntityColumns: ProcessManyToManyColumnSettingsItem[];
      currentEntityItems: Entity[];
      extraColumns?: ProcessManyToManyColumnSettingsItem[];
      items: PersistanceRelationItem<RelationItemsData>[];
      tableName: string;
    },
    options?: { transactionManager?: RDBEntityManager }
  ): Promise<void> {
    const actualOptions = options || {};
    const { transactionManager } = actualOptions;
    // the transaction here is mandatory
    if (!transactionManager) {
      return this.repository.manager.transaction(tm => {
        return this.processManyToMany(data, { ...actualOptions, transactionManager: tm });
      }) as Promise<void>;
    }
    const { counterpartColumns, currentEntityColumns, currentEntityItems, extraColumns, items, tableName } = data;
    const { columnQuotesSymbol: cqs } = this.qb;
    let deleteQuery = `delete from ${cqs}${tableName}${cqs} where `;
    let deleteQueryItem = '(';
    let deleteQueryValues: unknown[] = [];
    let insertQuery = `insert into ${cqs}${tableName}${cqs} (`;
    let insertQueryItem = '(';
    let insertQueryValues: unknown[] = [];
    let runDeleteQuery = false;
    let runInsertQuery = false;
    currentEntityColumns.forEach(columnNameData => {
      const targetColumnName = columnNameData.targetColumnName || columnNameData.sourceColumnName;
      insertQuery += `${cqs}${targetColumnName}${cqs}, `;
      insertQueryItem += '?, ';
      deleteQueryItem += `${cqs}${targetColumnName}${cqs} = ? and `;
    });
    counterpartColumns.forEach(columnNameData => {
      const targetColumnName = columnNameData.targetColumnName || columnNameData.sourceColumnName;
      insertQuery += `${cqs}${targetColumnName}${cqs}, `;
      insertQueryItem += '?, ';
      deleteQueryItem += `${cqs}${targetColumnName}${cqs} = ? and `;
    });
    if (extraColumns?.length) {
      extraColumns.forEach(columnNameData => {
        insertQuery += `${cqs}${columnNameData.targetColumnName || columnNameData.sourceColumnName}${cqs}, `;
        insertQueryItem += '?, ';
      });
    }
    insertQuery = `${insertQuery.substring(0, insertQuery.length - 2)}) values `;
    insertQueryItem = `${insertQueryItem.substring(0, insertQueryItem.length - 2)})`;
    deleteQueryItem = `${deleteQueryItem.substring(0, deleteQueryItem.length - 4)})`;
    items.forEach(item => {
      const { deleted, ...itemData } = item;
      const itemColumnValues = [
        ...counterpartColumns.map(columnNameData => itemData[columnNameData.sourceColumnName as keyof typeof itemData]),
        ...(extraColumns?.map(columnNameData => itemData[columnNameData.sourceColumnName as keyof typeof itemData]) ||
          [])
      ];
      if (deleted) {
        if (runDeleteQuery) {
          deleteQuery += ' or ';
        } else {
          runDeleteQuery = true;
        }
        deleteQuery += deleteQueryItem;
        currentEntityItems.forEach(currentEntityItem => {
          deleteQueryValues = [
            ...deleteQueryValues,
            ...currentEntityColumns.map(columnNameData => currentEntityItem[columnNameData.sourceColumnName]),
            ...itemColumnValues
          ];
        });
        return;
      }
      if (runInsertQuery) {
        insertQuery += ', ';
      } else {
        runInsertQuery = true;
      }
      insertQuery += insertQueryItem;
      currentEntityItems.forEach(currentEntityItem => {
        insertQueryValues = [
          ...insertQueryValues,
          ...currentEntityColumns.map(columnNameData => currentEntityItem[columnNameData.sourceColumnName]),
          ...itemColumnValues
        ];
      });
    });
    if (runDeleteQuery) {
      await transactionManager.query(deleteQuery, deleteQueryValues);
    }
    if (runInsertQuery) {
      await transactionManager.query(`${insertQuery}`, insertQueryValues);
    }
  }

  // protected async processOneToMany<RelationItemsData>(
  //   data: {
  //     counterpartPrimaryKeys?: string[];
  //     currentEntityForeignKeys: string[];
  //     currentEntityItems: Entity[];
  //     relatedEntityItems: PersistanceRelationItem<RelationItemsData>[];
  //   },
  //   options?: { transactionManager?: RDBEntityManager }
  // ): Promise<void> {
  //   const actualOptions = options || {};
  //   const { transactionManager } = actualOptions;
  //   // the transaction here is also mandatory
  //   if (!transactionManager) {
  //     return this.repository.manager.transaction(tm => {
  //       return this.processOneToMany(data, { ...actualOptions, transactionManager: tm });
  //     }) as Promise<void>;
  //   }
  //   const { primaryKeys } = this;
  //   const { columnQuotesSymbol: cqs } = this.qb;
  //   const { counterpartPrimaryKeys, currentEntityForeignKeys, currentEntityItems, relatedEntityItems } = data;
  // }

  // // TODO: functionality for the delete method
  // protected async processRelationsData(
  //   data: Data['Create'] | Data['Update'],
  //   options?: ProcessRelationsDataOptions<Entity>
  // ): Promise<void> {
  //   const actualOptions = options || ({} as ProcessRelationsDataOptions<Entity>);
  //   const { transactionManager } = actualOptions;
  //   // the transaction here is mandatory too
  //   if (!transactionManager) {
  //     return this.repository.manager.transaction(tm => {
  //       return this.processRelationsData(data, { ...actualOptions, transactionManager: tm });
  //     }) as Promise<void>;
  //   }
  //   const {  } = this;
  //   for (const fieldName in data) {
  //     // if ()
  //     this.repository.manager.getRepository()
  //   }
  // }

  protected async save<Data = unknown, ReturnData = unknown>(
    data: Data,
    transactionManager?: RDBEntityManager,
    options?: { processObjectAllowedFieldsEnabled?: boolean }
  ): Promise<ReturnData> {
    const { columNames, repository } = this;
    const { processObjectAllowedFieldsEnabled } = options || {};
    const dataToSave: Data | Data[] = await this.processObjectAllowedFields<Data>(data, {
      allowedFields: columNames,
      isEnabled: processObjectAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Input
    });
    try {
      if (transactionManager) {
        return (await transactionManager.save(repository.target, dataToSave as Partial<Entity>)) as ReturnData;
      }
      return repository.save(dataToSave as Partial<Entity>) as ReturnData;
    } catch (e) {
      const error = e as Record<string, unknown>;
      // TODO: move this functionality out of here and make this abstract
      if (error.code === PostgresErrorCode.UniqueViolation) {
        const extractVariableName = new RegExp(/^Key \((.*)\)\=(.*)$/g);
        const result = extractVariableName.exec(error.detail as string);
        throw new ApplicationError(
          `${error.table}: ${result ? result[1] : 'a column value you have provided'} needs to be unique`
        );
      }
      throw e;
    }
  }

  async update(
    data: Data['Update'],
    options: UpdateOptions,
    privateOptions?: UpdatePrivateOptions
  ): Promise<PersistanceUpdateResult<Entity>> {
    const { columNames, repository } = this;
    const { filters, forceTransaction, returnData, returnOriginalItems, transactionManager } = options;
    const {
      processFiltersAllowedFieldsEnabled,
      processInputAllowedFieldsEnabled,
      withDeleted = false
    } = privateOptions || {};
    if (!transactionManager && forceTransaction) {
      return repository.manager.transaction(tm => {
        return this.update(data, { ...options, transactionManager: tm }, privateOptions);
      }) as Promise<PersistanceUpdateResult<Entity>>;
    }
    const dataToUpdate = (await this.processObjectAllowedFields(data instanceof Array ? data[0] : data, {
      allowedFields: columNames,
      isEnabled: processInputAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Input
    })) as Partial<Entity>;
    if (!Object.keys(dataToUpdate).length) {
      throw new ApplicationError('At least one field for update is required.');
    }
    const entityName = repository.metadata.name;
    const tableName = repository.metadata.tableName;
    const processedFilters = (await this.processObjectAllowedFields<GenericObject>(filters, {
      allowedFields: this.columNames,
      isEnabled: processFiltersAllowedFieldsEnabled,
      objectType: ProcessObjectAllowedFieldsType.Filters
    })) as GenericObject;
    if (!Object.keys(processedFilters).length) {
      throw new ApplicationError('At least one filter field for update is required.');
    }
    const queryBuilder = this.getRepository(transactionManager)
      .createQueryBuilder(entityName)
      .update()
      .set(dataToUpdate);
    const { where: parsedWhere, include } = this.qb.parseFilters(tableName, processedFilters, {
      fieldAliases: this.columnAliases
    });
    const hasInclude = Object.keys(include).length;
    let originalItems: Entity[] = [];
    let where: { [fieldName: string]: ParsedFilter } = {};
    if (hasInclude || returnOriginalItems) {
      const findData = await this.find(
        { filters: processedFilters, findAll: true, transactionManager },
        { processFiltersAllowedFieldsEnabled: false }
      );
      const { field, value } = this.buildPrimaryKeyWhereClause(findData.items);
      originalItems = findData.items;
      where[field] = value;
    } else {
      where = parsedWhere;
    }
    this.qb.buildQuery<Entity>(queryBuilder, {
      currentEntityName: this.getEntityTarget() as string,
      deletedColumnName: this.deletedColumnName,
      entityManager: this.repository.manager,
      where,
      withDeleted
    });
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    if (returnOriginalItems) {
      dataToReturn.originalItems = originalItems;
    }
    // find the updated data
    if (returnData) {
      let result: OrmUpdateQueryBuilderUpdateResult;
      // if returning is supported by the db, it's easy
      if (this.qb.returningSupported) {
        result = await queryBuilder.returning('*').execute();
      }
      // otherwise, run a find on the db to get all items by the originally provided filters
      // that are already used for the update
      else {
        result = await queryBuilder.execute();
        const { items: updatedItems } = await this.find(
          {
            filters: processedFilters,
            findAll: true,
            transactionManager
          },
          { processFiltersAllowedFieldsEnabled: false }
        );
        // remove any related entities that might have been joined for the search
        if (hasInclude) {
          const keysToDelete: string[] = [];
          for (const entityName in include) {
            keysToDelete.push(entityName.split('.')[0]);
          }
          updatedItems.forEach((updatedItem, updatedItemIndex) => {
            keysToDelete.forEach(keyToDelete => delete updatedItem[keyToDelete]);
            updatedItems[updatedItemIndex] = updatedItem;
          });
        }
        result.raw = updatedItems;
      }
      // TODO: consider using generatedMaps, instead of raw (only applies to returningSupported=true)
      dataToReturn.count = (result.raw as Entity[]).length;
      dataToReturn.items = result.raw as Entity[];
      // TODO: automatic processManyToMany
    } else {
      const result = await queryBuilder.execute();
      dataToReturn.count = typeof result.affected === 'number' ? result.affected : undefined;
    }
    return dataToReturn;
  }
}
