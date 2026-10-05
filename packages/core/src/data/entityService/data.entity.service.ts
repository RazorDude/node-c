import type {
  AppConfigCommonData,
  AppConfigCommonDataEntityServiceSettings
} from '../../common/configProvider/configProvider.definitions.js';
import type { ConfigProviderService } from '../../common/configProvider/configProvider.service.js';
import { ApplicationError } from '../../common/definitions/common.errors.js';
import type { LoggerService } from '../../common/logger/logger.service.js';
import type {
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
} from './data.entity.service.definitions.js';

/**
 * This class is used as a unifying abstraction between RDB and non-RDB entities. It can be used
 * to define classes that are agnostic of the type of persitance.
 */
export abstract class DataEntityService<
  Entity,
  Data extends DataDefaultData<Entity> = DataDefaultData<Entity>
> {
  protected settings: AppConfigCommonDataEntityServiceSettings;

  constructor(
    protected configProvider: ConfigProviderService,
    protected dataModuleName: string,
    protected logger: LoggerService
  ) {
    const { settingsPerEntity } = configProvider.config.data[
      dataModuleName
    ] as AppConfigCommonData;
    this.settings = settingsPerEntity || {};
  }

  public bulkCreate(
    _data: Data['BulkCreate'],
    _options?: unknown,
    _privateOptions?: DataBulkCreatePrivateOptions
  ): Promise<Entity[]> {
    throw new ApplicationError(
      `Method bulkCreate not implemented for class ${typeof this}.`
    );
  }

  public count(
    _options: DataFindOptions,
    _privateOptions?: DataCountPrivateOptions
  ): Promise<number | undefined> {
    throw new ApplicationError(
      `Method count not implemented for class ${typeof this}.`
    );
  }

  public create(
    _data: Data['Create'],
    _options?: unknown,
    _privateOptions?: DataCreatePrivateOptions
  ): Promise<Entity> {
    throw new ApplicationError(
      `Method create not implemented for class ${typeof this}.`
    );
  }

  public delete(
    _options: DataDeleteOptions,
    _privateOptions?: DataDeletePrivateOptions
  ): Promise<DataDeleteResult<Entity>> {
    throw new ApplicationError(
      `Method delete not implemented for class ${typeof this}.`
    );
  }

  public find(
    _options: DataFindOptions,
    _privateOptions?: DataFindPrivateOptions
  ): Promise<DataFindResults<Entity>> {
    throw new ApplicationError(
      `Method find not implemented for class ${typeof this}.`
    );
  }

  public findOne(
    _options: DataFindOneOptions,
    _privateOptions?: DataFindOnePrivateOptions
  ): Promise<Entity | null> {
    throw new ApplicationError(
      `Method findOne not implemented for class ${typeof this}.`
    );
  }

  public getEntityName(noError?: boolean): string | null {
    if (noError) {
      return null;
    }
    throw new ApplicationError(
      `Method getEntityName not implemented for class ${typeof this}.`
    );
  }

  // TODO: handle relations' fields
  // biome-ignore lint/suspicious/useAwait: Legacy.
  protected async processObjectAllowedFields<DataObject = Partial<Entity>>(
    data: DataObject | DataObject[],
    options: ProcessObjectAllowedFieldsOptions
  ): Promise<DataObject | DataObject[]> {
    const { settings } = this;
    const { allowedFields, isEnabled, objectType } = options;
    if (
      isEnabled === false ||
      (typeof isEnabled === 'undefined' &&
        !settings[objectType as keyof typeof settings])
    ) {
      return data;
    }
    const actualData = Array.isArray(data) ? data : [data];
    const processedData: DataObject[] = [];
    actualData.forEach((dataItem) => {
      const processedDataItem = {} as DataObject;
      allowedFields.forEach((fieldName) => {
        const typedFieldName = fieldName as unknown as keyof DataObject;
        const value = dataItem[typedFieldName];
        if (typeof value !== 'undefined') {
          processedDataItem[typedFieldName] = value;
        }
      });
      processedData.push(processedDataItem);
    });
    return processedData.length === 1 ? processedData[0] : processedData;
  }

  public update(
    _data: Data['Update'],
    _options: DataUpdateOptions,
    _privateOptions?: DataUpdatePrivateOptions
  ): Promise<DataUpdateResult<Entity>> {
    throw new ApplicationError(
      `Method update not implemented for class ${typeof this}.`
    );
  }
}
