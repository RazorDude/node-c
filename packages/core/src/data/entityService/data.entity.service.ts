import {
  DataBulkCreatePrivateOptions,
  DataCountPrivateOptions,
  DataCreatePrivateOptions,
  DataDefaultData,
  DataDeleteOptions,
  DataDeletePrivateOptions,
  DataDeleteResult,
  DataFindOneOptions,
  DataFindOnePrivateOptions,
  DataFindOptions,
  DataFindPrivateOptions,
  DataFindResults,
  DataUpdateOptions,
  DataUpdatePrivateOptions,
  DataUpdateResult,
  ProcessObjectAllowedFieldsOptions
} from './data.entity.service.definitions';

import {
  AppConfigCommonData,
  AppConfigCommonDataEntityServiceSettings,
  ConfigProviderService
} from '../../common/configProvider';
import { ApplicationError } from '../../common/definitions';

/*
 * This class is used as a unifying abstraction between RDB and non-RDB entities. It can be used
 * to define classes that are agnostic of the type of persitance.
 */
export abstract class DataEntityService<Entity, Data extends DataDefaultData<Entity> = DataDefaultData<Entity>> {
  protected settings: AppConfigCommonDataEntityServiceSettings;

  constructor(
    protected configProvider: ConfigProviderService,
    protected dataModuleName: string
  ) {
    const { settingsPerEntity } = configProvider.config.data[dataModuleName] as AppConfigCommonData;
    this.settings = settingsPerEntity || {};
  }

  public async bulkCreate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Data['BulkCreate'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataBulkCreatePrivateOptions
  ): Promise<Entity[]> {
    throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
  }

  public async count(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataFindOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataCountPrivateOptions
  ): Promise<number | undefined> {
    throw new ApplicationError(`Method count not implemented for class ${typeof this}.`);
  }

  public async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data: Data['Create'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataCreatePrivateOptions
  ): Promise<Entity> {
    throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
  }

  public delete(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataDeleteOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataDeletePrivateOptions
  ): Promise<DataDeleteResult<Entity>> {
    throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
  }

  public find(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataFindOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataFindPrivateOptions
  ): Promise<DataFindResults<Entity>> {
    throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
  }

  public findOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataFindOneOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataFindOnePrivateOptions
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

  // TODO: handle relations' fields
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
    _data: Data['Update'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: DataUpdateOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _privateOptions?: DataUpdatePrivateOptions
  ): Promise<DataUpdateResult<Entity>> {
    throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
  }
}
