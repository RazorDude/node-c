import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfigCommonDataNoSQLValidationSettings,
  AppConfigDataNoSQL,
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants,
  GenericObject,
  getNested,
  setNested
} from '@node-c/core';

import { ValidationSchema, registerSchema, validate } from 'class-validator';
import ld from 'lodash';
import { v4 as uuid } from 'uuid';

import {
  EntitySchema,
  EntitySchemaColumnType,
  FilterItemOptions,
  GetValuesFromResultsOptions,
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
  protected _innerPrimaryKeysMap: GenericObject<boolean>;
  protected _primaryKeys: string[];
  protected _primaryKeysMap: GenericObject<boolean>;
  protected defaultTTL?: number;
  protected defaultIndividualSearchEnabled: boolean;
  protected experimentalDeletionEnabled: boolean = false;
  protected storeDelimiter: string;
  protected validationSchemaProperties: ValidationSchema['properties'];
  protected validationSettings: AppConfigCommonDataNoSQLValidationSettings;

  public get columnNames(): string[] {
    return this._columnNames;
  }
  public get innerPrimaryKeys(): string[] {
    return this._innerPrimaryKeys;
  }
  public get innerPrimaryKeysMap(): GenericObject<boolean> {
    return this._innerPrimaryKeysMap;
  }
  public get dataModuleName(): string {
    return this._dataModuleName;
  }
  public get primaryKeys(): string[] {
    return this._primaryKeys;
  }
  public get primaryKeysMap(): GenericObject<boolean> {
    return this._primaryKeysMap;
  }

  constructor(
    protected configProvider: ConfigProviderService,
    @Inject(CoreConstants.DATA_MODULE_NAME)
    protected _dataModuleName: string,
    @Inject(Constants.REDIS_REPOSITORY_SCHEMA)
    protected schema: EntitySchema,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    const { defaultIndividualSearchEnabled, defaultTTL, storeDelimiter, settingsPerEntity } = configProvider.config
      .data[_dataModuleName] as AppConfigDataNoSQL;
    const { columns, name: entityName } = schema;
    const columnNames: string[] = [];
    const innerPrimaryKeys: string[] = [];
    const innerPrimaryKeysMap: GenericObject<boolean> = {};
    const primaryKeys: string[] = [];
    const primaryKeysMap: GenericObject<boolean> = {};
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
        primaryKeysMap[columnName] = true;
      } else if (isInnerPrimary) {
        innerPrimaryKeys.push(columnName);
        innerPrimaryKeysMap[columnName] = true;
      }
      if (validationProperties) {
        validationSchemaProperties[columnName] = validationProperties;
      }
    }
    this._columnNames = columnNames;
    this._innerPrimaryKeys = innerPrimaryKeys;
    this._innerPrimaryKeysMap = innerPrimaryKeysMap;
    this._primaryKeys = primaryKeys.sort(
      (columnName0, columnName1) => columns[columnName0].primaryOrder! - columns[columnName1].primaryOrder!
    );
    this._primaryKeysMap = primaryKeysMap;
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

  // protected async delete

  async find<ResultItem extends Entity | string = Entity>(
    options: RepositoryFindOptions,
    privateOptions?: RepositoryFindPrivateOptions
  ): Promise<{ items: ResultItem[]; more: boolean }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { name: entityName, storeKey: entityStoreKey } = schema;
    const { filters, findAll, individualSearch, withValues: optWithValues } = options;
    const { requirePrimaryKeys } = privateOptions || {};
    const individualSearchEnabled =
      typeof individualSearch !== 'undefined' ? individualSearch : this.defaultIndividualSearchEnabled;
    const primaryKeyFiltersToForceCheck: GenericObject<boolean> = {};
    const storeEntityKeys: string[] = [];
    const withValues = typeof optWithValues === 'undefined' || optWithValues === true ? true : false;
    let hasNonPrimaryKeyFilters = false;
    let primaryKeyFiltersCount = 0;
    if (filters && Object.keys(filters).length) {
      // set up the construction of the store keys by primary keys
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
              primaryKeyFiltersToForceCheck[field] = true;
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
    } else if (!findAll) {
      throw new ApplicationError(
        `[RedisRepositoryService ${entityName}][Error]: ` +
          'Either filters or findAll is required when calling the find method.'
      );
    }
    // findAll logic:
    // if doing an inidividual search, go through the store keys one by one; all PKs are required;
    // if doing a wildcard search, iterate a cursor through the whole database until returned to the start
    if (findAll) {
      if (individualSearchEnabled && !primaryKeyFiltersCount && primaryKeys.length) {
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Error]: ` +
            'Primary key filters are required when findAll and individualSearchEnabled ' +
            'are enabled in the find method.'
        );
      }
      let initialResults: ResultItem[] = [];
      // get the base results
      if (individualSearchEnabled) {
        initialResults = (await Promise.all(
          storeEntityKeys.map(key => store.get(`${entityStoreKey}${key}`, { parseToJSON: true }))
        )) as ResultItem[];
      } else {
        // TODO: if no filters are provided, this will not return anything
        // TODO: (reply, some point later) WDYIM, Rumen?
        const scanData = await store.scan(`${entityStoreKey}${storeEntityKeys[0]}`, {
          parseToJSON: true,
          scanAll: findAll,
          withValues
        });
        initialResults = scanData.values as ResultItem[];
      }
      // filter the base results by inner keys, as well as retrieve items from arrays and nested items
      return {
        items: this.getValuesFromResults(initialResults, {
          filters,
          hasNonPrimaryKeyFilters,
          primaryKeyFiltersToForceCheck
        }),
        more: false
      };
    }
    // non-findAll logic:
    // if doing an inidividual search, go through the store keys one by one; all PKs are required;
    // if doing a wildcard search, iterate a cursor through the whole database until the pagination end is reached
    const { page, perPage } = options || {};
    // for non-individual search, we'll only have the first key anyway
    // TODO: check whether the above is true nad apply it to findAll if it isn't
    const [storeEntityKey] = storeEntityKeys;
    const count: number = perPage || 100;
    const limit = count + 1;
    let cursor = (page ? page - 1 : 0) * count;
    let more = false;
    let results: ResultItem[] = [];
    while (results.length < limit) {
      let endReached = false;
      let iterationResults: ResultItem[] = [];
      // get the base results
      if (individualSearchEnabled) {
        const iterationLimit = cursor + limit;
        const iterationPromises: Promise<ResultItem>[] = [];
        for (let i = cursor; i < iterationLimit; i++) {
          const key = storeEntityKeys[i];
          if (!key) {
            endReached = true;
            break;
          }
          iterationPromises.push(store.get(`${entityStoreKey}${key}`, { parseToJSON: true }));
        }
        iterationResults = (await Promise.all(iterationPromises)) as ResultItem[];
        cursor = iterationLimit;
      } else {
        const { cursor: newCursor, values: innerResults } = await store.scan(`${entityStoreKey}${storeEntityKey}`, {
          count,
          cursor,
          parseToJSON: true,
          scanAll: false,
          withValues
        });
        iterationResults = innerResults as ResultItem[];
        if (newCursor === 0) {
          endReached = true;
        } else {
          cursor = newCursor;
        }
      }
      // filter the base results by inner keys, as well as retrieve items from arrays and nested items;
      // the beauty of this approach is that it follows the rules of the pagination regardless of whether
      // the results are coming from nested items or not
      results = results.concat(
        this.getValuesFromResults(iterationResults, {
          filters,
          hasNonPrimaryKeyFilters,
          primaryKeyFiltersToForceCheck
        })
      );
      if (endReached) {
        break;
      }
    }
    // determine whether this is the end of the pagination
    if (results.length > count) {
      more = true;
      results = results.slice(0, count);
    }
    return { items: results, more };
  }

  protected filterItem<Item>(item: Item, filters: GenericObject<unknown>, options?: FilterItemOptions): boolean {
    if (typeof item === 'undefined' || item === null) {
      return false;
    }
    const { keysToSkip, skippableKeysToForceCheck } = options || {};
    let filterResult = true;
    for (const key in filters) {
      if (keysToSkip?.[key] && !skippableKeysToForceCheck?.[key]) {
        continue;
      }
      const filterValue = filters[key];
      const itemValue = (item as GenericObject<unknown>)[key];
      if (filterValue instanceof Array) {
        if (!filterValue.includes(itemValue)) {
          filterResult = false;
          break;
        }
        continue;
      }
      // TODO: filter operators
      if (filterValue !== itemValue) {
        filterResult = false;
        break;
      }
    }
    return filterResult;
  }

  // TODO: reduce the large numbers of whole-array iterations by combinging the array methods used
  // here into a big for-loop
  protected getValuesFromResults<ResultItem>(
    inputData: ResultItem[],
    options?: GetValuesFromResultsOptions
  ): ResultItem[] {
    const { primaryKeysMap, schema } = this;
    const { isArray, nestedObjectContainerPath } = schema;
    const { filters, flattenArray, hasNonPrimaryKeyFilters, primaryKeyFiltersToForceCheck } = options || {};
    let initialResults = [...inputData];
    if (nestedObjectContainerPath) {
      initialResults = initialResults.map(item => {
        if (item && typeof item === 'object' && !(item instanceof Date)) {
          return getNested(item, nestedObjectContainerPath, { removeNestedFieldEscapeSign: true }).unifiedValue;
        }
        return item;
      }) as ResultItem[];
    }
    if (isArray && (flattenArray || typeof flattenArray === 'undefined')) {
      initialResults = initialResults.flat() as ResultItem[];
    }
    if (!hasNonPrimaryKeyFilters || !filters) {
      return initialResults.filter(item => typeof item !== 'undefined' && item !== null);
    }
    // filter by the results' object data
    return initialResults.filter(item =>
      this.filterItem<ResultItem>(item, filters, {
        keysToSkip: primaryKeysMap,
        skippableKeysToForceCheck: primaryKeyFiltersToForceCheck
      })
    );
  }

  protected async prepare(data: Entity, options?: PrepareOptions): Promise<{ data: Entity; storeEntityKey: string }> {
    const { primaryKeys, schema, store, storeDelimiter } = this;
    const { columns, name: entityName, storeKey: entityStoreKey } = schema;
    const opt = options || ({} as PrepareOptions);
    const { generatePrimaryKeys, onConflict: optOnConflict, validate: optValidate } = opt;
    const onConflict = optOnConflict || SaveOptionsOnConflict.ThrowError;
    let allPKValuesExist = true;
    let preparedData = ld.cloneDeep(data) as GenericObject<unknown>;
    let storeEntityKey = '';
    // set up the construction of the store keys by primary keys
    // additionally, perform the generation of primary keys, if doing a create opearation
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
    if (storeEntityKey.endsWith(storeDelimiter)) {
      storeEntityKey = storeEntityKey.substring(0, storeEntityKey.length - storeDelimiter.length);
    }
    if (optValidate) {
      const validationErrors = await validate(entityName, data as GenericObject<unknown>);
      if (validationErrors.length) {
        throw new ApplicationError(
          `[RedisRepositoryService ${entityName}][Validation Error]: ${validationErrors.join('\n')}`
        );
      }
    }
    // TODO: make this work using getValuesFromResults
    if (onConflict !== SaveOptionsOnConflict.DoNothing && allPKValuesExist) {
      const hasValue = await store.get<string | undefined>(storeEntityKey, { withValues: false });
      if (hasValue) {
        if (onConflict === SaveOptionsOnConflict.ThrowError) {
          throw new ApplicationError(
            `[RedisRepositoryService ${entityName}][Unique Error]: An entry already exists for key ${storeEntityKey}.`
          );
        }
        if (onConflict === SaveOptionsOnConflict.Update) {
          const existingData = await store.get<GenericObject<unknown>>(storeEntityKey, { parseToJSON: true });
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
    const { defaultTTL, experimentalDeletionEnabled, innerPrimaryKeys, primaryKeysMap, schema, store, storeDelimiter } =
      this;
    const { isArray, nestedObjectContainerPath, storeKey: entityStoreKey } = schema;
    const {
      delete: optDelete,
      generatePrimaryKeys,
      onConflict,
      transactionId,
      ttl,
      validate
    } = options || ({} as SaveOptions);
    const actualData = data instanceof Array ? data : [data];
    if (optDelete) {
      const prepareOptions: PrepareOptions = {
        generatePrimaryKeys: false,
        onConflict: SaveOptionsOnConflict.DoNothing,
        validate: false
      };
      const deleteKeys: string[] = [];
      for (const i in actualData) {
        deleteKeys.push(
          `${entityStoreKey}${storeDelimiter}${(await this.prepare(actualData[i], prepareOptions)).storeEntityKey}`
        );
      }
      // delete from arrays and nestedObjects;
      // this is kind of a repeat of find, but with the key paths included and with dedicated
      // filtering by inner primary keys
      if (
        experimentalDeletionEnabled &&
        (isArray || nestedObjectContainerPath) &&
        innerPrimaryKeys.length &&
        deleteKeys.length
      ) {
        const results = await Promise.all(deleteKeys.map(key => store.get<ResultItem>(key, { parseToJSON: true })));
        // const deletePromises: Promise<unknown>[] = [];
        const newResults: ResultItem[] = [];
        results.forEach((resultItem, resultItemIndex) => {
          if (!resultItem || typeof resultItem !== 'object' || resultItem instanceof Date) {
            newResults.push(resultItem);
            return;
          }
          let innerPaths: string[] = [];
          let innerValues: ResultItem[] = [];
          if (nestedObjectContainerPath) {
            const { paths, values } = getNested(resultItem, nestedObjectContainerPath, {
              removeNestedFieldEscapeSign: true
            });
            innerPaths = paths;
            innerValues = values as ResultItem[];
            // TODO: combine with isArray
          } else if (isArray) {
            innerValues = resultItem as ResultItem[];
          } else {
            innerValues = [resultItem];
          }
          // TODO: complete this logic
          innerValues.forEach((innerValue, innerValueIndex) => {
            const shouldDelete = this.filterItem<ResultItem>(
              innerValue,
              actualData[resultItemIndex] as GenericObject<unknown>,
              {
                keysToSkip: primaryKeysMap
              }
            );
            if (!shouldDelete) {
              return;
            }
            if (innerPaths[innerValueIndex]) {
              setNested(results[resultItemIndex], innerPaths[innerValueIndex], undefined, {
                removeNestedFieldEscapeSign: true
              });
              return;
            }
            if (isArray) {
              setNested(results, `${resultItemIndex}`, (resultItem as ResultItem[]).splice(innerValueIndex, 1), {
                removeNestedFieldEscapeSign: true
              });
              return;
            }
            results.splice(resultItemIndex, 1);
          });
        });
        return [];
      }
      // default use case - regular people storing regular objects in redis
      if (deleteKeys.length) {
        await store.delete(deleteKeys, { transactionId });
      }
      return deleteKeys as ResultItem[];
    }
    // TODO: create and update in arrays and nestedObjects
    // TODO: differenatiate between create and update based on generatePrimaryKeys
    const prepareOptions: PrepareOptions = {
      generatePrimaryKeys,
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
