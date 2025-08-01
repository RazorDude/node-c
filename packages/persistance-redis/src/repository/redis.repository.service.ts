import { Inject, Injectable } from '@nestjs/common';

import { AppConfigPersistanceNoSQL, ApplicationError, ConfigProviderService } from '@node-c/core';

import { validate } from 'class-validator';
import immutable, { Collection } from 'immutable';
import { mergeDeepRight } from 'ramda';
import { v4 as uuid } from 'uuid';

import {
  EntitySchema,
  EntitySchemaColumnType,
  PrepareOptions,
  RepositoryFindOptions,
  SaveOptions,
  SaveOptionsOnConflict
} from './redis.repository.definitions';

import { Constants } from '../common/definitions';
import { RedisStoreService } from '../store';

// TODO: support "paranoid" mode
// TODO: support complex filtering, not just equality
// TODO: support indexing
// TODO: support validations according to the rules in the schema
// TODO: support defining the keys' delimiter symbol
@Injectable()
export class RedisRepositoryService<Entity> {
  protected defaultTTL?: number;
  protected primaryKeys: string[];
  protected storeDelimiter: string;

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(Constants.REDIS_CLIENT_PERSISTANCE_MODULE_NAME)
    protected persistanceModuleName: string,
    @Inject(Constants.REDIS_REPOSITORY_SCHEMA)
    // eslint-disable-next-line no-unused-vars
    protected schema: EntitySchema,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    const { defaultTTL, storeDelimiter, ttlPerEntity } = configProvider.config.persistance[
      persistanceModuleName
    ] as AppConfigPersistanceNoSQL;
    const { columns, name: entityName } = schema;
    const primaryKeys: string[] = [];
    this.defaultTTL = ttlPerEntity?.[entityName] || defaultTTL;
    for (const columnName in columns) {
      const { primary, primaryOrder } = columns[columnName];
      if (primary) {
        if (typeof primaryOrder === 'undefined') {
          throw new ApplicationError(
            `At schema "${entityName}", column "${columnName}": the field "primaryOrder" is required for primary key columns.`
          );
        }
        primaryKeys.push(columnName);
      }
    }
    this.primaryKeys = primaryKeys.sort(
      (columnName0, columnName1) => columns[columnName0].primaryOrder! - columns[columnName1].primaryOrder!
    );
    this.storeDelimiter = storeDelimiter || Constants.DEFAULT_STORE_DELIMITER;
  }

  async find<ResultItem extends Entity | string = Entity>(options: RepositoryFindOptions): Promise<ResultItem[]> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { name: entityName } = schema;
    const { exactSearch, filters, findAll, page, perPage, withValues: optWithValues } = options;
    const paginationOptions: { count?: number; cursor?: number } = {};
    const primaryKeyFiltersToForceCheck: string[] = [];
    const withValues = typeof optWithValues === 'undefined' || optWithValues === true ? true : false;
    let count: number = 0;
    let hasNonPrimaryKeyFilters = false;
    let storeEntityKey = '';
    if (filters && Object.keys(filters).length) {
      let primaryKeyFiltersCount = 0;
      storeEntityKey =
        storeDelimiter +
        primaryKeys
          .map(field => {
            const value = filters[field];
            if (
              typeof value !== 'undefined' &&
              typeof value !== 'object' &&
              (typeof value !== 'string' || value.length)
            ) {
              primaryKeyFiltersCount++;
              return value;
            }
            if (value instanceof Array) {
              const finalValues: (string | number)[] = [];
              value.forEach(valueItem => {
                // unfortunately, a glob OR pattern doesn't exist
                // if (typeof valueItem === 'string') {
                //   finalValues.push(`[${valueItem.replace('*', '').replace(storeDelimiter, '')}]`);
                //   return;
                // }
                // if (typeof valueItem === 'number') {
                //   finalValues.push(`[${valueItem}]`);
                //   return;
                // }
                if (
                  (typeof valueItem === 'string' && !valueItem.length) ||
                  (typeof valueItem !== 'string' && typeof valueItem !== 'number')
                ) {
                  return;
                }
                finalValues.push(valueItem);
              });
              if (finalValues.length) {
                // primaryKeyFiltersCount++;
                // return finalValues.join('');
                hasNonPrimaryKeyFilters = true;
                primaryKeyFiltersToForceCheck.push(field);
                return '*';
              }
            }
            if (exactSearch) {
              throw new ApplicationError(
                `[RedisRepositoryService ${entityName}][Find Error]: ` +
                  `The primary key field ${field} is required when exactSearch is set to true.`
              );
            }
            return '*';
          })
          .join(storeDelimiter);
      if (!hasNonPrimaryKeyFilters) {
        hasNonPrimaryKeyFilters = primaryKeyFiltersCount === Object.keys(filters).length;
      }
      if (!findAll) {
        count = perPage || 100;
        paginationOptions.count = count;
        paginationOptions.cursor = (page ? page - 1 : 0) * count;
      }
    } else if (!findAll) {
      throw new ApplicationError(
        `[RedisRepositoryService ${entityName}][Error]: ` +
          'Either filters or findAll is required when calling the find method.'
      );
    }
    if (findAll) {
      const { values: initialResults } = await store.scan(`${entityName}${storeEntityKey}`, {
        ...paginationOptions,
        parseToJSON: true,
        scanAll: findAll,
        withValues
      });
      if (!hasNonPrimaryKeyFilters) {
        return initialResults as ResultItem[];
      }
      return initialResults.filter(item => {
        let filterResult = true;
        for (const key in filters) {
          if (primaryKeys.includes(key) && !primaryKeyFiltersToForceCheck.includes(key)) {
            continue;
          }
          const filterValue = filters[key];
          const itemValue = (item as Record<string, unknown>)[key];
          if (filterValue instanceof Array) {
            if (!filterValue.includes(itemValue)) {
              filterResult = false;
              break;
            }
            continue;
          }
          if (filterValue !== itemValue) {
            filterResult = false;
            break;
          }
        }
        return filterResult;
      }) as ResultItem[];
    }
    let results: ResultItem[] = [];
    while (results.length < count) {
      const { cursor: newCursor, values: innerResults } = await store.scan(`${entityName}${storeEntityKey}`, {
        ...paginationOptions,
        parseToJSON: true,
        scanAll: false,
        withValues
      });
      results = results.concat(
        innerResults.filter(item => {
          let filterResult = true;
          for (const key in filters) {
            if (primaryKeys.includes(key)) {
              continue;
            }
            if ((item as Record<string, unknown>)[key] !== filters[key]) {
              filterResult = false;
              break;
            }
          }
          return filterResult;
        }) as ResultItem[]
      );
      if (newCursor === 0) {
        break;
      }
      paginationOptions.cursor = newCursor;
    }
    if (results.length > count) {
      results = results.slice(0, count);
    }
    return results;
  }

  // TODO: fix the validation, as it causes errors when the object is not a class-validator-decorated class
  protected async prepare(data: Entity, options?: PrepareOptions): Promise<{ data: Entity; storeEntityKey: string }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { columns, name: entityName } = schema;
    const opt = options || ({} as PrepareOptions);
    const { generatePrimaryKeys, onConflict: optOnConflict, validate: optValidate } = opt;
    const onConflict = optOnConflict || SaveOptionsOnConflict.ThrowError;
    let allPKValuesExist = true;
    let preparedData = (immutable.fromJS(data!) as Collection<unknown, unknown>).toJS() as Record<string, unknown>;
    let storeEntityKey = '';
    for (const columnName of primaryKeys) {
      const { generated, type } = columns[columnName];
      const value = preparedData[columnName];
      const valueExists = !(
        typeof value === 'undefined' ||
        (typeof value === 'string' && !value.length) ||
        typeof value === 'object'
      );
      if (generated) {
        if (valueExists) {
          storeEntityKey += `${value}`;
          continue;
        }
        if (allPKValuesExist) {
          allPKValuesExist = false;
        }
        if (!generatePrimaryKeys) {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Validation Error]: ` +
              `A value is required for generated PK column ${columnName} when the generatePrimaryKeys is set to false.`
          );
        }
        if (type === EntitySchemaColumnType.Integer) {
          let currentMaxValue =
            (await store.get<number>(`${entityName}${storeDelimiter}increment${storeDelimiter}${columnName}`, {
              parseToJSON: true
            })) || 0;
          currentMaxValue++;
          await store.set(`${entityName}${storeDelimiter}increment${storeDelimiter}${columnName}`, currentMaxValue);
          preparedData[columnName] = currentMaxValue;
          storeEntityKey += `${currentMaxValue}${storeDelimiter}`;
          continue;
        }
        if (type === EntitySchemaColumnType.UUIDV4) {
          let newValue = uuid();
          if (storeDelimiter === '-') {
            newValue = newValue.replace(/-/g, '_');
          }
          preparedData[columnName] = newValue;
          storeEntityKey += `${newValue}${storeDelimiter}`;
          continue;
        }
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Validation Error]: ` +
            `Unrecognized type "${type}" for PK column ${columnName}`
        );
      }
      if (!valueExists) {
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Validation Error]: ` +
            `A value is required for non-generated PK column ${columnName}`
        );
      }
      storeEntityKey += `${value}`;
    }
    if (optValidate) {
      const validationErrors = await validate(data as Record<string, unknown>);
      if (validationErrors.length) {
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Validation Error]: ${validationErrors.join('\n')}`
        );
      }
    }
    // TODO: escape regex symbols
    storeEntityKey = storeEntityKey.replace(new RegExp(`${storeDelimiter}$`), '');
    if (onConflict !== SaveOptionsOnConflict.DoNothing && allPKValuesExist) {
      const existingValue = await store.get<string | undefined>(storeEntityKey, { parseToJSON: false });
      if (existingValue) {
        if (onConflict === SaveOptionsOnConflict.ThrowError) {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Unique Error]: An entry already exists for key ${storeEntityKey}.`
          );
        }
        if (onConflict === SaveOptionsOnConflict.Update) {
          const existingData = JSON.parse(existingValue) as Record<string, unknown>;
          preparedData = mergeDeepRight(existingData, preparedData);
        } else {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Execution Error]: ` +
              `Invalid value "${onConflict}" provided for onConflict.`
          );
        }
      }
    }
    return { data: preparedData as unknown as Entity, storeEntityKey };
  }

  async save<ResultItem extends Entity | string = Entity>(
    data: Entity | Entity[],
    options?: SaveOptions
  ): Promise<ResultItem[]> {
    const { defaultTTL, schema, store, storeDelimiter } = this;
    const { name: entityName } = schema;
    const { delete: optDelete, onConflict, transactionId, ttl, validate } = options || ({} as SaveOptions);
    const actualData = data instanceof Array ? data : [data];
    if (optDelete) {
      const prepareOptions: PrepareOptions = {
        onConflict: SaveOptionsOnConflict.DoNothing,
        validate
      };
      const deleteKeys: string[] = [];
      for (const i in actualData) {
        deleteKeys.push(
          `${entityName}${storeDelimiter}${(await this.prepare(actualData[i], prepareOptions)).storeEntityKey}`
        );
      }
      if (deleteKeys.length) {
        await store.delete(deleteKeys, { transactionId });
      }
      return deleteKeys as ResultItem[];
    }
    const prepareOptions: PrepareOptions = {
      generatePrimaryKeys: true,
      onConflict,
      validate
    };
    const results: Entity[] = [];
    for (const i in actualData) {
      const { data: validatedEntity, storeEntityKey } = await this.prepare(actualData[i], prepareOptions);
      await store.set(`${entityName}${storeDelimiter}${storeEntityKey}`, validatedEntity, {
        transactionId,
        ttl: ttl || defaultTTL
      });
      results.push(validatedEntity);
    }
    return results as ResultItem[];
  }
}
