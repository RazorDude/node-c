import { Inject, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import immutable from 'immutable';
import { mergeDeepRight } from 'ramda';
import { v4 as uuid } from 'uuid';

import {
  EntitySchema,
  EntitySchemaColumnType,
  FindOptions,
  PrepareOptions,
  SaveOptions,
  SaveOptionsOnConflict
} from './redis.repository.definitions';

import { ApplicationError, Constants } from '../../../common/definitions';
import { RedisStoreService } from '../store';

// TODO: support "paranoid" mode
// TODO: support filtering by keys AND values, and indexing
// TODO: support validations according to the rules in the schema
@Injectable()
export class RedisRepositoryService<Entity> {
  protected primaryKeys: string[];

  constructor(
    @Inject(Constants.REDIS_REPOSITORY_SCHEMA)
    // eslint-disable-next-line no-unused-vars
    protected schema: EntitySchema,
    // eslint-disable-next-line no-unused-vars
    protected store: RedisStoreService
  ) {
    // console.log('===>', schema, store);
    const { columns } = schema;
    const primaryKeys: string[] = [];
    for (const columnName in columns) {
      const { primary } = columns[columnName];
      if (primary) {
        primaryKeys.push(columnName);
      }
    }
    this.primaryKeys = primaryKeys;
  }

  async find<ResultItem extends Entity | string = Entity>(options: FindOptions): Promise<ResultItem[]> {
    const { primaryKeys, schema, store } = this;
    const { name: entityName } = schema;
    const { exactSearch, filters, findAll, page, perPage, withValues: optWithValues } = options;
    const paginationOptions: { count?: number; cursor?: number } = {};
    const withValues = typeof optWithValues === 'undefined' || optWithValues === true ? true : false;
    let storeEntityKey = '';
    if (filters) {
      storeEntityKey =
        '-' +
        primaryKeys
          .map(field => {
            const value = filters[field];
            if (
              typeof value !== 'undefined' &&
              typeof value !== 'object' &&
              (typeof value !== 'string' || value.length)
            ) {
              return value;
            }
            if (exactSearch) {
              throw new ApplicationError(
                `[RedisRepositoryService ${entityName}][Find Error]: ` +
                  `The primary key field ${field} is required when exactSearch is set to true.`
              );
            }
            return '*';
          })
          .join('-');
      if (!findAll) {
        const count = perPage || 100;
        paginationOptions.count = count;
        paginationOptions.cursor = (page ? page - 1 : 0) * count;
      }
    } else if (!findAll) {
      throw new ApplicationError(
        `[RedisRepositoryService ${entityName}][Error]: ` +
          'Either filters or findAll is required when calling the find method.'
      );
    }
    return await store.scan(`${entityName}${storeEntityKey}`, { ...paginationOptions, scanAll: findAll, withValues });
  }

  protected async prepare(data: Entity, options?: PrepareOptions): Promise<{ data: Entity; storeEntityKey: string }> {
    const { primaryKeys, schema, store } = this;
    const { columns, name: entityName } = schema;
    const opt = options || ({} as PrepareOptions);
    const { generatePrimaryKeys, onConflict: optOnConflict, validate: optValidate } = opt;
    const onConflict = optOnConflict || SaveOptionsOnConflict.ThrowError;
    let allPKValuesExist = true;
    let preparedData = immutable.fromJS(data!).toJS() as Record<string, unknown>;
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
            (await store.get<number>(`${entityName}-increment-${columnName}`, { parseToJSON: true })) || 0;
          currentMaxValue++;
          await store.set(`${entityName}-increment-${columnName}`, currentMaxValue);
          preparedData[columnName] = currentMaxValue;
          storeEntityKey += `${currentMaxValue}-`;
          continue;
        }
        if (type === EntitySchemaColumnType.UUIDV4) {
          const newValue = uuid().replace(/-/g, '_');
          preparedData[columnName] = newValue;
          storeEntityKey += `${newValue}-`;
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
    storeEntityKey = storeEntityKey.replace(/-$/, '');
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
    const { schema, store } = this;
    const { name: entityName } = schema;
    const { delete: optDelete, onConflict, transactionId } = options || ({} as SaveOptions);
    const actualData = data instanceof Array ? data : [data];
    if (optDelete) {
      const prepareOptions: PrepareOptions = {
        onConflict: SaveOptionsOnConflict.DoNothing,
        validate: true
      };
      const deleteKeys: string[] = [];
      for (const i in actualData) {
        deleteKeys.push((await this.prepare(actualData[i], prepareOptions)).storeEntityKey);
      }
      await store.delete(deleteKeys, { transactionId });
      return deleteKeys as ResultItem[];
    }
    const prepareOptions: PrepareOptions = {
      generatePrimaryKeys: true,
      onConflict,
      validate: true
    };
    const results: Entity[] = [];
    for (const i in actualData) {
      const { data: validatedEntity, storeEntityKey } = await this.prepare(actualData[i], prepareOptions);
      await store.set(`${entityName}-${storeEntityKey}`, validatedEntity, { transactionId });
      results.push(validatedEntity);
    }
    return results as ResultItem[];
  }
}
