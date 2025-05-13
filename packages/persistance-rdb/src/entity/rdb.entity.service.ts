import {
  ApplicationError,
  GenericObject,
  PersistanceDeleteResult,
  PersistanceEntityService,
  PersistanceFindResults,
  PersistanceNumberItem,
  PersistanceOrderBy,
  PersistanceSelectOperator,
  PersistanceUpdateResult
} from '@node-c/core';

import { RDBEntitySchema } from './rdb.entity.schema';
import {
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  DeleteOptions,
  FindOneOptions,
  FindOptions,
  PostgresErrorCode,
  UpdateOptions
} from './rdb.entity.service.definitions';

import { RDBEntityManager, RDBRepository } from '../repository';
import { IncludeItems, ParsedFilter, SQLQueryBuilderService } from '../sqlQueryBuilder';

// TODO: support for the "select" options in find and findOne (a.k.a. which fields to return)
// TODO: enforce the above to be always set to the primary key for the count method
// TODO: support update of multiple items in the update method
export class RDBEntityService<Entity extends GenericObject<unknown>> extends PersistanceEntityService<Entity> {
  protected primaryKeys: string[];

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected qb: SQLQueryBuilderService,
    // eslint-disable-next-line no-unused-vars
    protected repository: RDBRepository<Entity>,
    protected schema: RDBEntitySchema
  ) {
    super();
    const { columns } = schema.options;
    const primaryKeys: string[] = [];
    for (const columnName in columns) {
      if (columns[columnName]?.primary) {
        primaryKeys.push(columnName);
      }
    }
    this.primaryKeys = primaryKeys;
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

  async bulkCreate(data: Partial<Entity>[], options?: BulkCreateOptions): Promise<Entity[]> {
    const actualOptions = Object.assign(options || {}) as BulkCreateOptions;
    const { forceTransaction, transactionManager } = actualOptions;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.bulkCreate(data, { ...actualOptions, transactionManager: tm });
      }) as Promise<Entity[]>;
    }
    return await this.save(data, transactionManager);
  }

  async create(data: Partial<Entity>, options?: CreateOptions): Promise<Entity> {
    const actualOptions = Object.assign(options || {}) as CreateOptions;
    const { forceTransaction, transactionManager } = actualOptions;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.create(data, { ...actualOptions, transactionManager: tm });
      }) as Promise<Entity>;
    }
    try {
      return await this.save(data, transactionManager);
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

  async count(options: CountOptions): Promise<number | undefined> {
    const { filters, forceTransaction, transactionManager, withDeleted = false } = options;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.count({ ...options, transactionManager: tm });
      }) as Promise<number>;
    }
    const entityName = this.repository.metadata.name;
    const tableName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    const { where, include: includeFromFilters } = this.qb.parseFilters(tableName, filters!);
    const include = this.qb.parseRelations(tableName, [], includeFromFilters);
    this.qb.buildQuery<Entity>(queryBuilder, { where, include, withDeleted });
    return await queryBuilder.getCount();
  }

  async delete(options: DeleteOptions): Promise<PersistanceDeleteResult<Entity>> {
    const { filters, forceTransaction, returnOriginalItems, transactionManager, softDelete = true } = options;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.delete({ ...options, transactionManager: tm });
      }) as Promise<PersistanceDeleteResult<Entity>>;
    }
    const entityName = this.repository.metadata.name;
    // TODO: check whether tableName is needed here instead of name
    const tableName = this.repository.metadata.name;
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    const deleteType = softDelete ? 'softDelete' : 'delete';
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName)[deleteType]();
    const { where: parsedWhere, include } = this.qb.parseFilters(tableName, filters);
    let where: { [fieldName: string]: ParsedFilter } = {};
    if (Object.keys(include).length || returnOriginalItems) {
      const findData = await this.find({ filters, transactionManager });
      const { field, value } = this.buildPrimaryKeyWhereClause(findData.items);
      where[field] = value;
      dataToReturn.originalItems = findData.items;
    } else {
      where = parsedWhere;
    }
    this.qb.buildQuery<Entity>(queryBuilder, { where });
    const result = await queryBuilder.execute();
    return { ...dataToReturn, count: typeof result.affected === 'number' ? result.affected : undefined };
  }

  async find(options: FindOptions): Promise<PersistanceFindResults<Entity>> {
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
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.find({ ...options, transactionManager: tm });
      }) as Promise<PersistanceFindResults<Entity>>;
    }
    const page = optPage ? parseInt(optPage as unknown as string, 10) : 1; // make sure it's truly a number - it could come as string from GET requests
    const perPage = optPerPage ? parseInt(optPerPage as unknown as string, 10) : 10; // same as above - must be a number
    const findAll = optFindAll === true || (optFindAll as unknown) === 'true';
    const findResults: PersistanceFindResults<Entity> = { page: 1, perPage: 0, items: [], more: false };
    const entityName = this.repository.metadata.name;
    const tableName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    let where: { [fieldName: string]: ParsedFilter } = {};
    let include: IncludeItems = {};
    let orderBy: PersistanceOrderBy[] = [];
    if (filters) {
      const parsedFiltersData = this.qb.parseFilters(tableName, filters);
      where = { ...parsedFiltersData.where };
      include = { ...parsedFiltersData.include };
    }
    include = this.qb.parseRelations(tableName, optRelations || [], include);
    if (optOrderBy) {
      const parsedOrderByData = this.qb.parseOrderBy(tableName, optOrderBy);
      include = { ...parsedOrderByData.include, ...include };
      orderBy = [...parsedOrderByData.orderBy];
    }
    this.qb.buildQuery<Entity>(queryBuilder, { where, include, orderBy, withDeleted });
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
        findResults.totalCount = await this.count(options);
      }
    }
    findResults.items = items;
    return findResults;
  }

  async findOne(options: FindOneOptions): Promise<Entity | null> {
    const {
      filters,
      forceTransaction,
      transactionManager,
      selectOperator,
      include: optRelations,
      orderBy: optOrderBy,
      withDeleted = false
    } = options;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.findOne({ ...options, transactionManager: tm });
      }) as Promise<Entity | null>;
    }
    const entityName = this.repository.metadata.name;
    const tableName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName);
    const { where, include: includeFromFilters } = this.qb.parseFilters(tableName, filters, {
      operator: selectOperator as PersistanceSelectOperator,
      isTopLevel: true
    });
    const include = this.qb.parseRelations(tableName, optRelations || [], includeFromFilters);
    let orderBy: PersistanceOrderBy[] = [];
    if (optOrderBy) {
      const parsedOrderByData = this.qb.parseOrderBy(tableName, optOrderBy);
      orderBy = [...parsedOrderByData.orderBy];
    }
    this.qb.buildQuery<Entity>(queryBuilder, { where, include, orderBy, withDeleted });
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

  // TODO: introduce this in the bulkCreate, create, update and delete methods
  // TODO: support a primary key that's not "id", as well as multiple primary keys
  protected async processManyToMany(
    data: {
      counterpartColumn: string;
      currentEntityColumn: string;
      id: number;
      items: PersistanceNumberItem[];
      tableName: string;
    },
    options?: { transactionManager?: RDBEntityManager }
  ): Promise<void> {
    const { currentEntityColumn, id, counterpartColumn, items, tableName } = data;
    const actualOptions = options || {};
    const { transactionManager } = actualOptions;
    // the transaction here is mandatory
    if (!transactionManager) {
      return this.repository.manager.transaction(tm => {
        return this.processManyToMany(data, { ...actualOptions, transactionManager: tm });
      }) as Promise<void>;
    }
    const { columnQuotesSymbol: cqs } = this.qb;
    let deleteQuery = `delete from ${cqs}${tableName}${cqs} where `;
    let runDeleteQuery = false;
    let insertQuery = `insert into ${cqs}${tableName}${cqs} (${cqs}${currentEntityColumn}${cqs}, ${cqs}${counterpartColumn}${cqs}) values `;
    let runInsertQuery = false;
    items.forEach(item => {
      const { deleted, value } = item;
      if (deleted) {
        if (runDeleteQuery) {
          deleteQuery += ' or ';
        } else {
          runDeleteQuery = true;
        }
        deleteQuery += `(${cqs}${currentEntityColumn}${cqs} = ${id} and ${cqs}${counterpartColumn}${cqs} = ${value})`;
        return;
      }
      if (runInsertQuery) {
        insertQuery += ', ';
      } else {
        runInsertQuery = true;
      }
      insertQuery += `(${id}, ${value})`;
    });
    if (runDeleteQuery) {
      await transactionManager.query(deleteQuery);
    }
    if (runInsertQuery) {
      await transactionManager.query(`${insertQuery} on conflict do nothing`);
    }
  }

  protected async save<Data = unknown, ReturnData = unknown>(
    data: Data,
    transactionManager?: RDBEntityManager
  ): Promise<ReturnData> {
    if (transactionManager) {
      return (await transactionManager.save(this.repository.target, data as Partial<Entity>)) as ReturnData;
    }
    return this.repository.save(data as Partial<Entity>) as ReturnData;
  }

  async update(data: Entity, options: UpdateOptions): Promise<PersistanceUpdateResult<Entity>> {
    const { filters, forceTransaction, returnData, returnOriginalItems, transactionManager } = options;
    if (!transactionManager && forceTransaction) {
      return this.repository.manager.transaction(tm => {
        return this.update(data, { ...options, transactionManager: tm });
      }) as Promise<PersistanceUpdateResult<Entity>>;
    }
    const entityName = this.repository.metadata.name;
    // TODO: check whether tableName is needed here instead of name
    const tableName = this.repository.metadata.name;
    const queryBuilder = this.getRepository(transactionManager).createQueryBuilder(entityName).update().set(data);
    const { where: parsedWhere, include } = this.qb.parseFilters(tableName, filters);
    let originalItems: Entity[] = [];
    let where: { [fieldName: string]: ParsedFilter } = {};
    if (Object.keys(include).length || returnOriginalItems) {
      const findData = await this.find({ filters, transactionManager });
      const { field, value } = this.buildPrimaryKeyWhereClause(findData.items);
      originalItems = findData.items;
      where[field] = value;
    } else {
      where = parsedWhere;
    }
    this.qb.buildQuery<Entity>(queryBuilder, { where });
    const dataToReturn: PersistanceUpdateResult<Entity> = {};
    if (returnOriginalItems) {
      dataToReturn.originalItems = originalItems;
    }
    if (returnData) {
      const result = await queryBuilder.returning('*').execute();
      // TODO: consider using generatedMaps, instead of raw
      dataToReturn.count = (result.raw as Entity[]).length;
      dataToReturn.items = result.raw as Entity[];
    } else {
      const result = await queryBuilder.execute();
      dataToReturn.count = typeof result.affected === 'number' ? result.affected : undefined;
    }
    return dataToReturn;
  }
}
