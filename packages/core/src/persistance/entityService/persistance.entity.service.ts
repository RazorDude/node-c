import {
  PersistanceBulkCreatePrivateOptions,
  PersistanceCountPrivateOptions,
  PersistanceCreatePrivateOptions,
  PersistanceDeleteOptions,
  PersistanceDeletePrivateOptions,
  PersistanceDeleteResult,
  PersistanceFindOneOptions,
  PersistanceFindOnePrivateOptions,
  PersistanceFindOptions,
  PersistanceFindPrivateOptions,
  PersistanceFindResults,
  PersistanceUpdateOptions,
  PersistanceUpdatePrivateOptions,
  PersistanceUpdateResult,
  ProcessObjectAllowedFieldsOptions
} from './persistance.entity.service.definitions';

import {
  AppConfigCommonPersistance,
  AppConfigCommonPersistanceEntityServiceSettings,
  ConfigProviderService
} from '../../common/configProvider';
import { ApplicationError } from '../../common/definitions';

/*
 * This class is used as a unifying abstraction between RDB and non-RDB entities. It can be used
 * to define classes that are agnostic of the type of persitance.
 */
export abstract class PersistanceEntityService<Entity> {
  protected settings: AppConfigCommonPersistanceEntityServiceSettings;

  constructor(
    protected configProvider: ConfigProviderService,
    protected persistanceModuleName: string
  ) {
    const { settingsPerEntity } = configProvider.config.persistance[
      persistanceModuleName
    ] as AppConfigCommonPersistance;
    this.settings = settingsPerEntity || {};
  }

  public async bulkCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Partial<Entity>[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceBulkCreatePrivateOptions
  ): Promise<Entity[]> {
    throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
  }

  public async count(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceFindOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceCountPrivateOptions
  ): Promise<number | undefined> {
    throw new ApplicationError(`Method count not implemented for class ${typeof this}.`);
  }

  public async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Partial<Entity>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceCreatePrivateOptions
  ): Promise<Entity> {
    throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
  }

  public delete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceDeleteOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceDeletePrivateOptions
  ): Promise<PersistanceDeleteResult<Entity>> {
    throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
  }

  public find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceFindOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceFindPrivateOptions
  ): Promise<PersistanceFindResults<Entity>> {
    throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
  }

  public findOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceFindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceFindOnePrivateOptions
  ): Promise<Entity | null> {
    throw new ApplicationError(`Method findOne not implemented for class ${typeof this}.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getEntityName(noError?: boolean): string | null {
    if (noError) {
      return null;
    }
    throw new ApplicationError(`Method getEntityName not implemented for class ${typeof this}.`);
  }

  protected async processObjectAllowedFields<Data = Partial<Entity>>(
    data: Data | Data[],
    options: ProcessObjectAllowedFieldsOptions
  ): Promise<Data | Data[]> {
    const { settings } = this;
    const { allowedFields, isEnabled, objectType } = options;
    if (isEnabled === false || (typeof isEnabled === 'undefined' && !settings[objectType as keyof typeof settings])) {
      return data;
    }
    const actualData = data instanceof Array ? data : [data];
    const processedData: Data[] = [];
    actualData.forEach(dataItem => {
      const processedDataItem = {} as Data;
      allowedFields.forEach(fieldName => {
        const typedFieldName = fieldName as unknown as keyof Data;
        const value = dataItem[typedFieldName];
        if (typeof value !== 'undefined') {
          processedDataItem[typedFieldName] = value;
        }
      });
      processedData.push(processedDataItem);
    });
    return processedData.length === 1 ? processedData[0] : processedData;
  }

  public async update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Partial<Entity>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PersistanceUpdateOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: PersistanceUpdatePrivateOptions
  ): Promise<PersistanceUpdateResult<Entity>> {
    throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
  }
}
