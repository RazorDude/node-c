import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfigCommonPersistanceNoSQLValidationSettings,
  AppConfigPersistanceNoSQL,
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants
} from '@node-c/core';

import { ValidationSchema, registerSchema, validate } from 'class-validator';
import ld from 'lodash';
import { v4 as uuid } from 'uuid';

import {
  EntitySchema,
  EntitySchemaColumnType,
  PrepareOptions,
  RepositoryFindOptions,
  RepositoryFindPrivateOptions,
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
  protected _columnNames: string[];
  protected _primaryKeys: string[];
  protected defaultTTL?: number;
  protected storeDelimiter: string;
  protected validationSchemaProperties: ValidationSchema['properties'];
  protected validationSettings: AppConfigCommonPersistanceNoSQLValidationSettings;

  public get columnNames(): string[] {
    return this._columnNames;
  }
  public get persistanceModuleName(): string {
    return this._persistanceModuleName;
  }
  public get primaryKeys(): string[] {
    return this._primaryKeys;
  }

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.PERSISTANCE_MODULE_NAME)
    protected _persistanceModuleName: string,
    @Inject(Constants.REDIS_REPOSITORY_SCHEMA)
    protected schema: EntitySchema,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    const { defaultTTL, storeDelimiter, settingsPerEntity } = configProvider.config.persistance[
      _persistanceModuleName
    ] as AppConfigPersistanceNoSQL;
    const { columns, name: entityName } = schema;
    const columnNames: string[] = [];
    const primaryKeys: string[] = [];
    const validationSchemaProperties: ValidationSchema['properties'] = {};
    this.defaultTTL = settingsPerEntity?.[entityName]?.ttl || defaultTTL;
    for (const columnName in columns) {
      const { primary, primaryOrder, validationProperties } = columns[columnName];
      columnNames.push(columnName);
      if (primary) {
        if (typeof primaryOrder === 'undefined') {
          throw new ApplicationError(
            `At schema "${entityName}", column "${columnName}": the field "primaryOrder" is required for primary key columns.`
          );
        }
        primaryKeys.push(columnName);
      }
      if (validationProperties) {
        validationSchemaProperties[columnName] = validationProperties;
      }
    }
    this._columnNames = columnNames;
    this._primaryKeys = primaryKeys.sort(
      (columnName0, columnName1) => columns[columnName0].primaryOrder! - columns[columnName1].primaryOrder!
    );
    this.storeDelimiter = storeDelimiter || Constants.DEFAULT_STORE_DELIMITER;
    this.validationSchemaProperties = validationSchemaProperties;
    registerSchema({ name: entityName, properties: validationSchemaProperties });
  }

  async find<ResultItem extends Entity | string = Entity>(
    options: RepositoryFindOptions,
    privateOptions?: RepositoryFindPrivateOptions
  ): Promise<ResultItem[]> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { name: entityName } = schema;
    const { filters, findAll, page, perPage, withValues: optWithValues } = options;
    const { requirePrimaryKeys } = privateOptions || {};
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
            if (requirePrimaryKeys) {
              throw new ApplicationError(
                `[RedisRepositoryService ${entityName}][Find Error]: ` +
                  `The primary key field ${field} is required when requirePrimaryKeys is set to true.`
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

  protected async prepare(data: Entity, options?: PrepareOptions): Promise<{ data: Entity; storeEntityKey: string }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { columns, name: entityName } = schema;
    const opt = options || ({} as PrepareOptions);
    const { generatePrimaryKeys, onConflict: optOnConflict, validate: optValidate } = opt;
    const onConflict = optOnConflict || SaveOptionsOnConflict.ThrowError;
    let allPKValuesExist = true;
    let preparedData = ld.cloneDeep(data) as Record<string, unknown>;
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
      const validationErrors = await validate(entityName, data as Record<string, unknown>);
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
          preparedData = ld.merge(existingData, preparedData);
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
        validate: false
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
