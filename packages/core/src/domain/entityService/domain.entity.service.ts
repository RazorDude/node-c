import ld from 'lodash';
import type { GenericObject } from '../../common/definitions/common.definitions.js';
import { ApplicationError } from '../../common/definitions/common.errors.js';
// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '../../common/logger/logger.service.js';
import type {
  DataDefaultData,
  DataFindResults
} from '../../data/entityService/data.entity.service.definitions.js';
// biome-ignore lint/style/useImportType: DI.
import { DataEntityService } from '../../data/entityService/data.entity.service.js';
import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  type DomainBaseAdditionalServiceOptionsOverrides,
  type DomainBulkCreateOptions,
  type DomainBulkCreatePrivateOptions,
  type DomainBulkCreateResult,
  type DomainCreateOptions,
  type DomainCreatePrivateOptions,
  type DomainCreateResult,
  DomainDataEntityServiceType,
  type DomainDeleteOptions,
  type DomainDeletePrivateOptions,
  type DomainDeleteResult,
  type DomainEntityServiceDefaultData,
  type DomainFindOneOptions,
  type DomainFindOnePrivateOptions,
  type DomainFindOneResult,
  type DomainFindOptions,
  type DomainFindPrivateOptions,
  type DomainFindResult,
  DomainMethod,
  type DomainRunMethodInAdditionalServicesOptions,
  type DomainUpdateOptions,
  type DomainUpdatePrivateOptions,
  type DomainUpdateResult
} from './domain.entity.service.definitions.js';

// TODO: privateOptionsOverrides by service
export class DomainEntityService<
  Entity,
  EntityService extends DataEntityService<Entity, DataEntityServiceData>,
  Data extends
    DomainEntityServiceDefaultData<Entity> = DomainEntityServiceDefaultData<Entity>,
  AdditionalEntityServices extends
    | Record<
        string,
        DataEntityService<Partial<Entity>, DataDefaultData<object>>
      >
    | undefined = undefined,
  DataEntityServiceData extends
    DataDefaultData<Entity> = DataDefaultData<Entity>
> {
  // biome-ignore lint/complexity/useMaxParams: DI in constructor
  constructor(
    protected dataEntityService: EntityService,
    // biome-ignore lint/style/useDefaultParameterLast: Rule doesn't apply here.
    protected defaultMethods: string[] = DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
    protected logger: LoggerService,
    protected additionalDataEntityServices?: AdditionalEntityServices,
    protected defaultAdditionalDataEntityServicesOptions?: {
      [methodName: string]: {
        [serviceName: string]: {
          serviceOptions?: DomainBaseAdditionalServiceOptionsOverrides &
            GenericObject<unknown>;
        };
      };
    }
  ) {}

  public bulkCreate(
    data: Data['BulkCreate'],
    options?: DomainBulkCreateOptions,
    privateOptions?: DomainBulkCreatePrivateOptions
  ): Promise<DomainBulkCreateResult<Entity>>;
  async bulkCreate(
    data: Data['BulkCreate'],
    options?: DomainBulkCreateOptions,
    privateOptions?: DomainBulkCreatePrivateOptions
  ): Promise<DomainBulkCreateResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.BulkCreate)) {
      throw new ApplicationError(
        `Method bulkCreate not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = dataServices;
    const result = await this.getDataService(firstServiceName).bulkCreate(
      data,
      otherOptions,
      privateOptions
    );
    let actualOtherServiceNames: string[] = [];
    let actualOptionsOverridesByService: typeof optionsOverridesByService = {};
    actualOtherServiceNames = otherServiceNames || [];
    actualOptionsOverridesByService = optionsOverridesByService;
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(
        actualOtherServiceNames,
        {
          firstServiceResult: result,
          hasFirstServiceResult: result.length > 0,
          methodArgs: [result, otherOptions, privateOptions],
          methodName: 'bulkCreate',
          optionsArgIndex: 1,
          optionsOverridesByService: actualOptionsOverridesByService
        }
      )
    };
  }

  public create(
    data: Data['Create'],
    options?: DomainCreateOptions,
    privateOptions?: DomainCreatePrivateOptions
  ): Promise<DomainCreateResult<Entity>>;
  async create<Options extends object | undefined = undefined>(
    data: Data['Create'],
    options?: DomainCreateOptions<Options>,
    privateOptions?: DomainCreatePrivateOptions
  ): Promise<DomainCreateResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.Create)) {
      throw new ApplicationError(
        `Method create not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = dataServices;
    const result = await this.getDataService(firstServiceName).create(
      data,
      otherOptions,
      privateOptions
    );
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(
        otherServiceNames || [],
        {
          firstServiceResult: result,
          hasFirstServiceResult:
            typeof result !== 'undefined' && result !== null,
          methodArgs: [result, otherOptions, privateOptions],
          methodName: 'create',
          optionsArgIndex: 1,
          optionsOverridesByService
        }
      )
    };
  }

  public delete(
    options: DomainDeleteOptions,
    privateOptions?: DomainDeletePrivateOptions
  ): Promise<DomainDeleteResult<Entity>>;
  async delete(
    options: DomainDeleteOptions,
    privateOptions?: DomainDeletePrivateOptions
  ): Promise<DomainDeleteResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.Delete)) {
      throw new ApplicationError(
        `Method delete not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = dataServices;
    const result = await this.getDataService(firstServiceName).delete(
      otherOptions,
      privateOptions
    );
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(
        otherServiceNames || [],
        {
          firstServiceResult: { ...result, items: result.originalItems || [] },
          hasFirstServiceResult: !result.count,
          methodArgs: [otherOptions, privateOptions],
          methodName: 'delete',
          optionsArgIndex: 0,
          optionsOverridesByService
        }
      )
    };
  }

  public find(
    options: DomainFindOptions,
    privateOptions?: DomainFindOnePrivateOptions
  ): Promise<DomainFindResult<Entity>>;
  async find(
    options: DomainFindOptions,
    privateOptions?: DomainFindOnePrivateOptions
  ): Promise<DomainFindResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.Find)) {
      throw new ApplicationError(
        `Method find not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      saveAdditionalResultsInFirstService,
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = dataServices;
    let result = await this.getDataService(firstServiceName).find(
      otherOptions,
      privateOptions
    );
    const hasFirstServiceResult = result.items.length > 0;
    const resultsByService = await this.runMethodInAdditionalServices<
      DataFindResults<Entity>
    >(otherServiceNames || [], {
      firstServiceResult: result,
      hasFirstServiceResult,
      methodArgs: [otherOptions, privateOptions],
      methodName: 'find',
      optionsArgIndex: 0,
      optionsOverridesByService
    });
    this.logger.log('DomainEntityService: ====>', { options, privateOptions });
    if (saveAdditionalResultsInFirstService && resultsByService) {
      const { saveOptions, serviceName, useResultsForFirstService } =
        saveAdditionalResultsInFirstService;
      const dataFromAdditionalService = resultsByService[serviceName];
      if (dataFromAdditionalService?.items?.length) {
        const bulkCreateResult = await this.dataEntityService.bulkCreate(
          dataFromAdditionalService.items,
          saveOptions
        );
        if (useResultsForFirstService && !hasFirstServiceResult) {
          result = dataFromAdditionalService;
        } else {
          result = {
            items: bulkCreateResult,
            more: false,
            page: 1,
            perPage: bulkCreateResult.length
          };
        }
      }
    }
    return {
      result,
      resultsByService
    };
  }

  public findOne(
    options: DomainFindOneOptions,
    privateOptions?: DomainFindPrivateOptions
  ): Promise<DomainFindOneResult<Entity>>;
  async findOne(
    options: DomainFindOneOptions,
    privateOptions?: DomainFindPrivateOptions
  ): Promise<DomainFindOneResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.FindOne)) {
      throw new ApplicationError(
        `Method findOne not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      saveAdditionalResultsInFirstService,
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = dataServices;
    let result: Entity | null = await this.getDataService(
      firstServiceName
    ).findOne(otherOptions, privateOptions);
    const hasFirstServiceResult =
      typeof result !== 'undefined' && result !== null;
    const resultsByService =
      await this.runMethodInAdditionalServices<Entity | null>(
        otherServiceNames || [],
        {
          firstServiceResult: result,
          hasFirstServiceResult,
          methodArgs: [otherOptions, privateOptions],
          methodName: 'findOne',
          optionsArgIndex: 0,
          optionsOverridesByService
        }
      );
    if (saveAdditionalResultsInFirstService && resultsByService) {
      const { saveOptions, serviceName, useResultsForFirstService } =
        saveAdditionalResultsInFirstService;
      const dataFromAdditionalService = resultsByService[serviceName];
      if (dataFromAdditionalService) {
        await this.dataEntityService.create(
          dataFromAdditionalService,
          saveOptions
        );
        if (useResultsForFirstService && !hasFirstServiceResult) {
          result = dataFromAdditionalService;
        }
      }
    }
    return {
      result,
      resultsByService
    };
  }

  protected getDataService(
    serviceName: DomainDataEntityServiceType.Main | string
  ): DataEntityService<Entity> {
    if (serviceName === DomainDataEntityServiceType.Main) {
      return this.dataEntityService;
    }
    const service = this.additionalDataEntityServices?.[serviceName];
    if (!service) {
      throw new ApplicationError(
        `DataEntityService ${serviceName} does not exist for DomainEntityService ${this.dataEntityService.getEntityName(true) || '(no entity name)'}.`
      );
    }
    return service as DataEntityService<Entity>;
  }

  protected async runMethodInAdditionalServices<ServiceReturnData>(
    serviceNames: string[],
    options: DomainRunMethodInAdditionalServicesOptions<unknown>
  ): Promise<GenericObject<ServiceReturnData> | undefined> {
    if (!serviceNames.length) {
      return undefined;
    }
    const {
      firstServiceResult,
      hasFirstServiceResult,
      methodArgs = [],
      methodName,
      optionsArgIndex,
      optionsOverridesByService = {}
    } = options;
    const returnDataByService: GenericObject<ServiceReturnData> = {};
    if (!this.additionalDataEntityServices) {
      throw new ApplicationError(
        `No additional DataEntityServices exist for DomainEntityService ${this.dataEntityService.getEntityName(true) || '(no entity name)'}.`
      );
    }
    if (
      Object.keys(optionsOverridesByService).length > 0 &&
      (typeof optionsArgIndex === 'undefined' ||
        optionsArgIndex < 0 ||
        optionsArgIndex > methodArgs.length - 1)
    ) {
      throw new ApplicationError(
        `Invalid optionsArgIndex value ${optionsArgIndex} provided for DomainEntityService ${this.dataEntityService.getEntityName(true) || '(no entity name)'}.}.`
      );
    }
    for (const i in serviceNames) {
      const serviceName = serviceNames[i];
      const service = this.getDataService(serviceName);
      if (!service) {
        throw new ApplicationError(
          `DataEntityService ${serviceName} does not exist for DomainEntityService ${this.dataEntityService.getEntityName(true) || '(no entity name)'}.`
        );
      }
      const serviceMethodOptionsOverrides =
        optionsOverridesByService[serviceName] || {};
      const {
        filterByFirstServiceResultFields,
        runOnNoFirstServiceResultOnly = true,
        ...actualMethodOptionsOverrides
      } = serviceMethodOptionsOverrides;
      // be extra careful when working with data that has TTL as the main service,
      // since there is no way to check for limited results here.
      if (
        (runOnNoFirstServiceResultOnly === true ||
          runOnNoFirstServiceResultOnly === 'true') &&
        hasFirstServiceResult
      ) {
        continue;
      }
      const serviceMethodArgs = ld.cloneDeep(methodArgs);
      if (typeof serviceMethodArgs[optionsArgIndex!] === 'undefined') {
        if (optionsArgIndex! > serviceMethodArgs.length - 1) {
          serviceMethodArgs.push(actualMethodOptionsOverrides);
        } else {
          serviceMethodArgs[optionsArgIndex!] = actualMethodOptionsOverrides;
        }
      } else {
        serviceMethodArgs[optionsArgIndex!] = {
          ...(serviceMethodArgs[optionsArgIndex!] as object),
          ...actualMethodOptionsOverrides
        };
      }
      if (
        filterByFirstServiceResultFields &&
        Object.keys(filterByFirstServiceResultFields).length > 0
      ) {
        if (!hasFirstServiceResult) {
          continue;
        }
        const filters: GenericObject = {};
        const resultItems: GenericObject[] = (
          firstServiceResult as { items?: GenericObject[] }
        ).items || [firstServiceResult as GenericObject];
        resultItems.forEach((resultItem) => {
          if (!resultItem) {
            return;
          }
          for (const sourceFieldName in filterByFirstServiceResultFields) {
            const fieldValue = resultItem[sourceFieldName];
            const targetFieldName =
              filterByFirstServiceResultFields[sourceFieldName];
            if (typeof fieldValue === 'undefined') {
              return;
            }
            if (!filters[targetFieldName]) {
              filters[targetFieldName] = [];
            }
            (filters[targetFieldName] as unknown[]).push(fieldValue);
          }
        });
        if (Object.keys(filters).length > 0) {
          const serviceMethodOptions = serviceMethodArgs[
            optionsArgIndex!
          ] as GenericObject & {
            filters?: GenericObject;
          };
          serviceMethodArgs[optionsArgIndex!] = {
            ...serviceMethodOptions,
            filters: {
              ...ld.omit(serviceMethodOptions.filters || {}, [
                'page',
                'perPage'
              ]),
              ...filters
            },
            findAll: true
          };
        }
      }
      returnDataByService[serviceName] = (await (
        service[methodName as keyof DataEntityService<Entity>] as unknown as (
          ..._args: unknown[]
        ) => Promise<ServiceReturnData>
      ).apply(service, serviceMethodArgs)) as ServiceReturnData;
    }
    return returnDataByService;
  }

  public update(
    data: Data['Update'],
    options: DomainUpdateOptions,
    privateOptions?: DomainUpdatePrivateOptions
  ): Promise<DomainUpdateResult<Entity>>;
  async update(
    data: Data['Update'],
    options: DomainUpdateOptions,
    privateOptions?: DomainUpdatePrivateOptions
  ): Promise<DomainUpdateResult<Entity>> {
    if (!this.defaultMethods.includes(DomainMethod.Update)) {
      throw new ApplicationError(
        `Method update not implemented for class ${typeof this}.`
      );
    }
    const {
      optionsOverridesByService,
      dataServices = [DomainDataEntityServiceType.Main],
      ...otherOptions
    } = options;
    const [firstServiceName, ...otherServiceNames] = dataServices;
    const result = await this.getDataService(firstServiceName).update(
      data,
      otherOptions,
      privateOptions
    );
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(
        otherServiceNames || [],
        {
          firstServiceResult: result,
          hasFirstServiceResult: !result.count,
          methodArgs: [data, otherOptions, privateOptions],
          methodName: 'update',
          optionsArgIndex: 1,
          optionsOverridesByService
        }
      )
    };
  }
}
