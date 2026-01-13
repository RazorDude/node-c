import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfigCommonPersistanceNoSQLValidationSettings,
  AppConfigPersistanceNoSQL,
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants,
  getNested
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
@Injectable()
export class RedisRepositoryService<Entity> {
  protected _columnNames: string[];
  protected _innerPrimaryKeys: string[];
  protected _primaryKeys: string[];
  protected defaultTTL?: number;
  protected defaultIndividualSearchEnabled: boolean;
  protected storeDelimiter: string;
  protected validationSchemaProperties: ValidationSchema['properties'];
  protected validationSettings: AppConfigCommonPersistanceNoSQLValidationSettings;

  public get columnNames(): string[] {
    return this._columnNames;
  }
  public get innerPrimaryKeys(): string[] {
    return this._innerPrimaryKeys;
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
    const { defaultIndividualSearchEnabled, defaultTTL, storeDelimiter, settingsPerEntity } = configProvider.config
      .persistance[_persistanceModuleName] as AppConfigPersistanceNoSQL;
    const { columns, name: entityName } = schema;
    const columnNames: string[] = [];
    const innerPrimaryKeys: string[] = [];
    const primaryKeys: string[] = [];
    const validationSchemaProperties: ValidationSchema['properties'] = {};
    for (const columnName in columns) {
      const { isInnerPrimary, primary, primaryOrder, validationProperties } = columns[columnName];
      columnNames.push(columnName);
      if (primary) {
        if (typeof primaryOrder === 'undefined') {
          throw new ApplicationError(
            `At schema "${entityName}", column "${columnName}": the field "primaryOrder" is required for primary key columns.`
          );
        }
        primaryKeys.push(columnName);
      }
      if (isInnerPrimary) {
        innerPrimaryKeys.push(columnName);
      }
      if (validationProperties) {
        validationSchemaProperties[columnName] = validationProperties;
      }
    }
    this._columnNames = columnNames;
    this._innerPrimaryKeys = innerPrimaryKeys;
    this._primaryKeys = primaryKeys.sort(
      (columnName0, columnName1) => columns[columnName0].primaryOrder! - columns[columnName1].primaryOrder!
    );
    this.defaultTTL = settingsPerEntity?.[entityName]?.ttl || defaultTTL;
    if (typeof settingsPerEntity?.[entityName]?.defaultIndividualSearchEnabled !== 'undefined') {
      this.defaultIndividualSearchEnabled = settingsPerEntity?.[entityName]?.defaultIndividualSearchEnabled;
    } else if (typeof defaultIndividualSearchEnabled !== 'undefined') {
      this.defaultIndividualSearchEnabled = defaultIndividualSearchEnabled;
    } else {
      this.defaultIndividualSearchEnabled = false;
    }
    this.storeDelimiter = storeDelimiter || Constants.DEFAULT_STORE_DELIMITER;
    this.validationSchemaProperties = validationSchemaProperties;
    registerSchema({ name: entityName, properties: validationSchemaProperties });
  }

  // TODO: reduce the large numbers of whole-array iterations on the found results
  async find<ResultItem extends Entity | string = Entity>(
    options: RepositoryFindOptions,
    privateOptions?: RepositoryFindPrivateOptions
  ): Promise<{ items: ResultItem[]; more: boolean }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { isArray, name: entityName, nestedObjectContainerPath, storeKey: entityStoreKey } = schema;
    const { filters, findAll, page, perPage, individualSearch, withValues: optWithValues } = options;
    const { requirePrimaryKeys } = privateOptions || {};
    const individualSearchEnabled =
      typeof individualSearch !== 'undefined' ? individualSearch : this.defaultIndividualSearchEnabled;
    const paginationOptions: { count?: number; cursor?: number } = {};
    const primaryKeyFiltersToForceCheck: string[] = [];
    const storeEntityKeys: string[] = [];
    const withValues = typeof optWithValues === 'undefined' || optWithValues === true ? true : false;
    let count: number = 0;
    let hasNonPrimaryKeyFilters = false;
    let primaryKeyFiltersCount = 0;
    if (filters && Object.keys(filters).length) {
      storeEntityKeys.push('');
      primaryKeys.forEach(field => {
        const value = filters[field];
        if (typeof value !== 'undefined' && typeof value !== 'object' && (typeof value !== 'string' || value.length)) {
          primaryKeyFiltersCount++;
          storeEntityKeys.forEach((_key, keyIndex) => {
            storeEntityKeys[keyIndex] += `${storeDelimiter}${value}`;
          });
          return;
        }
        if (value instanceof Array) {
          const finalValues: (string | number)[] = [];
          value.forEach(valueItem => {
            if (
              (typeof valueItem === 'string' && !valueItem.length) ||
              (typeof valueItem !== 'string' && typeof valueItem !== 'number')
            ) {
              return;
            }
            finalValues.push(valueItem);
          });
          if (finalValues.length) {
            // TODO: this will only work if the previous keys haven't been arrays
            if (individualSearchEnabled) {
              if (storeEntityKeys.length <= 1) {
                const baseStoreEntityKey = storeEntityKeys[0] || '';
                primaryKeyFiltersCount++;
                finalValues.forEach((finalValue, finalValueIndex) => {
                  const fullFinalValue = `${baseStoreEntityKey}${storeDelimiter}${finalValue}`;
                  if (typeof storeEntityKeys[finalValueIndex] === 'undefined') {
                    storeEntityKeys.push(fullFinalValue);
                    return;
                  }
                  storeEntityKeys[finalValueIndex] = fullFinalValue;
                });
                return;
              }
            } else {
              hasNonPrimaryKeyFilters = true;
              primaryKeyFiltersToForceCheck.push(field);
              storeEntityKeys[0] += `${storeDelimiter}*`;
              return;
            }
          }
        }
        if (requirePrimaryKeys) {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Find Error]: ` +
              `The primary key field ${field} is required when requirePrimaryKeys is set to true.`
          );
        }
        if (individualSearchEnabled) {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Find Error]: ` +
              `The primary key field ${field} is required when individualSearchEnabled ` +
              'is set to true.'
          );
        }
        storeEntityKeys[0] += `${storeDelimiter}*`;
      });
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
      if (individualSearchEnabled && !primaryKeyFiltersCount) {
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Error]: ` +
            'Primary key filters are required when findAll and individualSearchEnabled ' +
            'are enabled in the find method.'
        );
      }
      let initialResults: ResultItem[] = [];
      // get the base results
      if (individualSearchEnabled) {
        initialResults = (
          await Promise.all(storeEntityKeys.map(key => store.get(`${entityStoreKey}${key}`, { parseToJSON: true })))
        ).filter(item => item !== null) as ResultItem[];
      } else {
        // TODO: if no filters are provided, this will not return anything
        const scanData = await store.scan(`${entityStoreKey}${storeEntityKeys[0]}`, {
          ...paginationOptions,
          parseToJSON: true,
          scanAll: findAll,
          withValues
        });
        initialResults = scanData.values as ResultItem[];
      }
      if (nestedObjectContainerPath) {
        initialResults = initialResults
          .map(item => {
            if (item && typeof item === 'object' && !(item instanceof Date)) {
              return getNested(item, nestedObjectContainerPath).unifiedValue;
            }
            return item;
          })
          .filter(item => typeof item !== 'undefined' && item !== null) as ResultItem[];
      }
      if (isArray) {
        initialResults = initialResults.flat() as ResultItem[];
      }
      if (!hasNonPrimaryKeyFilters) {
        return { items: initialResults, more: false };
      }
      // filter by the results' object data
      return {
        items: initialResults.filter(item => {
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
        }) as ResultItem[],
        more: false
      };
    }
    // process non-findAll
    const [storeEntityKey] = storeEntityKeys;
    let more = false;
    let results: ResultItem[] = [];
    while (results.length < count) {
      let endReached = false;
      let iterationResults: ResultItem[] = [];
      // get the base results
      if (individualSearchEnabled) {
        iterationResults = (
          await Promise.all(storeEntityKeys.map(key => store.get(`${entityStoreKey}${key}`, { parseToJSON: true })))
        ).filter(item => item !== null) as ResultItem[];
        endReached = true;
      } else {
        const { cursor: newCursor, values: innerResults } = await store.scan(`${entityStoreKey}${storeEntityKey}`, {
          ...paginationOptions,
          parseToJSON: true,
          scanAll: false,
          withValues
        });
        iterationResults = innerResults as ResultItem[];
        if (newCursor === 0) {
          endReached = true;
        } else {
          paginationOptions.cursor = newCursor;
        }
      }
      if (nestedObjectContainerPath) {
        iterationResults = iterationResults
          .map(item => {
            if (item && typeof item === 'object' && !(item instanceof Date)) {
              return getNested(item, nestedObjectContainerPath).unifiedValue;
            }
            return item;
          })
          .filter(item => typeof item !== 'undefined' && item !== null) as ResultItem[];
      }
      if (isArray) {
        iterationResults = iterationResults.flat() as ResultItem[];
      }
      // filter by the results' object data
      results = results.concat(
        iterationResults.filter(item => {
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
      if (endReached) {
        break;
      }
    }
    if (results.length > count) {
      more = true;
      results = results.slice(0, count);
    }
    return { items: results, more };
  }

  // TODO: isArray support
  protected async prepare(data: Entity, options?: PrepareOptions): Promise<{ data: Entity; storeEntityKey: string }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { columns, name: entityName, storeKey: entityStoreKey } = schema;
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
          storeEntityKey += `${value}${storeDelimiter}`;
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
            (await store.get<number>(`${entityStoreKey}${storeDelimiter}increment${storeDelimiter}${columnName}`, {
              parseToJSON: true
            })) || 0;
          currentMaxValue++;
          await store.set(`${entityStoreKey}${storeDelimiter}increment${storeDelimiter}${columnName}`, currentMaxValue);
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
      storeEntityKey += `${value}${storeDelimiter}`;
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
    const { storeKey: entityStoreKey } = schema;
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
          `${entityStoreKey}${storeDelimiter}${(await this.prepare(actualData[i], prepareOptions)).storeEntityKey}`
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
      await store.set(`${entityStoreKey}${storeDelimiter}${storeEntityKey}`, validatedEntity, {
        transactionId,
        ttl: ttl || defaultTTL
      });
      results.push(validatedEntity);
    }
    return results as ResultItem[];
  }
}
