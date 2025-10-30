import Immutable from 'immutable';
import { omit } from 'ramda';

import {
  DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
  DomainBulkCreateOptions,
  DomainBulkCreatePrivateOptions,
  DomainBulkCreateResult,
  DomainCreateOptions,
  DomainCreatePrivateOptions,
  DomainCreateResult,
  DomainDeleteOptions,
  DomainDeletePrivateOptions,
  DomainDeleteResult,
  DomainEntityServiceDefaultData,
  DomainFindOneOptions,
  DomainFindOnePrivateOptions,
  DomainFindOneResult,
  DomainFindOptions,
  DomainFindPrivateOptions,
  DomainFindResult,
  DomainMethod,
  DomainPersistanceEntityServiceType,
  DomainRunMethodInAdditionalServicesOptions,
  DomainUpdateOptions,
  DomainUpdatePrivateOptions,
  DomainUpdateResult
} from './domain.entity.service.definitions';

import { ApplicationError, GenericObject } from '../../common/definitions';

import { PersistanceEntityService, PersistanceFindResults } from '../../persistance/entityService';

// TODO: privateOptionsOverrides by service
export class DomainEntityService<
  Entity,
  EntityService extends PersistanceEntityService<Entity>,
  Data extends DomainEntityServiceDefaultData<Entity> = DomainEntityServiceDefaultData<Entity>,
  AdditionalEntityServices extends Record<string, PersistanceEntityService<Partial<Entity>>> | undefined = undefined
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: EntityService,
    // eslint-disable-next-line no-unused-vars
    protected defaultMethods: string[] = DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS,
    // eslint-disable-next-line no-unused-vars
    protected additionalPersistanceEntityServices?: AdditionalEntityServices
  ) {}

  public bulkCreate(
    // eslint-disable-next-line no-unused-vars
    data: Data['BulkCreate'],
    // eslint-disable-next-line no-unused-vars
    options?: DomainBulkCreateOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainBulkCreatePrivateOptions
  ): Promise<DomainBulkCreateResult<Entity>>;
  async bulkCreate(
    data: Data['BulkCreate'],
    options?: DomainBulkCreateOptions,
    privateOptions?: DomainBulkCreatePrivateOptions
  ): Promise<DomainBulkCreateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.BulkCreate)) {
      throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
    }
    const { optionsOverridesByService, persistanceServices = [DomainPersistanceEntityServiceType.Main] } =
      options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).bulkCreate(data, privateOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        firstServiceResult: result,
        hasFirstServiceResult: result.length > 0,
        methodArgs: [result, privateOptions],
        methodName: 'bulkCreate',
        optionsArgIndex: 1,
        optionsOverridesByService
      })
    };
  }

  public create(
    // eslint-disable-next-line no-unused-vars
    data: Data['Create'],
    // eslint-disable-next-line no-unused-vars
    options?: DomainCreateOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainCreatePrivateOptions
  ): Promise<DomainCreateResult<Entity>>;
  async create<Options extends object | undefined = undefined>(
    data: Data['Create'],
    options?: DomainCreateOptions<Options>,
    privateOptions?: DomainCreatePrivateOptions
  ): Promise<DomainCreateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Create)) {
      throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
    }
    const { optionsOverridesByService, persistanceServices = [DomainPersistanceEntityServiceType.Main] } =
      options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).create(data, privateOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        firstServiceResult: result,
        hasFirstServiceResult: typeof result !== 'undefined' && result !== null,
        methodArgs: [result, privateOptions],
        methodName: 'create',
        optionsArgIndex: 1,
        optionsOverridesByService
      })
    };
  }

  public delete(
    // eslint-disable-next-line no-unused-vars
    options: DomainDeleteOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainDeletePrivateOptions
  ): Promise<DomainDeleteResult<Entity>>;
  async delete(
    options: DomainDeleteOptions,
    privateOptions?: DomainDeletePrivateOptions
  ): Promise<DomainDeleteResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Delete)) {
      throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
    }
    const {
      optionsOverridesByService,
      persistanceServices = [DomainPersistanceEntityServiceType.Main],
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).delete(otherOptions, privateOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        firstServiceResult: result,
        hasFirstServiceResult: !!result.count,
        methodArgs: [otherOptions, privateOptions],
        methodName: 'delete',
        optionsArgIndex: 0,
        optionsOverridesByService
      })
    };
  }

  public find(
    // eslint-disable-next-line no-unused-vars
    options: DomainFindOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainFindOnePrivateOptions
  ): Promise<DomainFindResult<Entity>>;
  async find(
    options: DomainFindOptions,
    privateOptions?: DomainFindOnePrivateOptions
  ): Promise<DomainFindResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Find)) {
      throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
    }
    const {
      optionsOverridesByService,
      persistanceServices = [DomainPersistanceEntityServiceType.Main],
      saveAdditionalResultsInFirstService,
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    let result = await this.getPersistanceService(firstServiceName).find(otherOptions, privateOptions);
    const hasFirstServiceResult = result.items.length > 0;
    const resultsByService = await this.runMethodInAdditionalServices<PersistanceFindResults<Entity>>(
      otherServiceNames || [],
      {
        firstServiceResult: result,
        hasFirstServiceResult,
        methodArgs: [otherOptions, privateOptions],
        methodName: 'find',
        optionsArgIndex: 0,
        optionsOverridesByService
      }
    );
    if (saveAdditionalResultsInFirstService && resultsByService) {
      const { saveOptions, serviceName, useResultsForFirstService } = saveAdditionalResultsInFirstService;
      const dataFromAdditionalService = resultsByService[serviceName];
      if (dataFromAdditionalService?.items?.length) {
        await this.persistanceEntityService.bulkCreate(dataFromAdditionalService.items, saveOptions);
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

  public findOne(
    // eslint-disable-next-line no-unused-vars
    options: DomainFindOneOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainFindPrivateOptions
  ): Promise<DomainFindOneResult<Entity>>;
  async findOne(
    options: DomainFindOneOptions,
    privateOptions?: DomainFindPrivateOptions
  ): Promise<DomainFindOneResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.FindOne)) {
      throw new ApplicationError(`Method findOne not implemented for class ${typeof this}.`);
    }
    const {
      optionsOverridesByService,
      persistanceServices = [DomainPersistanceEntityServiceType.Main],
      saveAdditionalResultsInFirstService,
      ...otherOptions
    } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    let result: Entity | null = await this.getPersistanceService(firstServiceName).findOne(
      otherOptions,
      privateOptions
    );
    const hasFirstServiceResult = typeof result !== 'undefined' && result !== null;
    const resultsByService = await this.runMethodInAdditionalServices<Entity | null>(otherServiceNames || [], {
      firstServiceResult: result,
      hasFirstServiceResult,
      methodArgs: [otherOptions, privateOptions],
      methodName: 'findOne',
      optionsArgIndex: 0,
      optionsOverridesByService
    });
    if (saveAdditionalResultsInFirstService && resultsByService) {
      const { saveOptions, serviceName, useResultsForFirstService } = saveAdditionalResultsInFirstService;
      const dataFromAdditionalService = resultsByService[serviceName];
      if (dataFromAdditionalService) {
        await this.persistanceEntityService.create(dataFromAdditionalService, saveOptions);
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

  protected getPersistanceService(
    serviceName: DomainPersistanceEntityServiceType.Main | string
  ): PersistanceEntityService<Entity> {
    if (serviceName === DomainPersistanceEntityServiceType.Main) {
      return this.persistanceEntityService;
    }
    const service = this.additionalPersistanceEntityServices?.[serviceName];
    if (!service) {
      throw new ApplicationError(
        `PersistanceEntityService ${serviceName} does not exist for DomainEntityService ${this.persistanceEntityService.getEntityName(true) || '(no entity name)'}.`
      );
    }
    return service as PersistanceEntityService<Entity>;
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
    if (!this.additionalPersistanceEntityServices) {
      throw new ApplicationError(
        `No additional PersistanceEntityServices exist for DomainEntityService ${this.persistanceEntityService.getEntityName(true) || '(no entity name)'}.`
      );
    }
    if (
      Object.keys(optionsOverridesByService).length &&
      (typeof optionsArgIndex === 'undefined' || optionsArgIndex < 0 || optionsArgIndex > methodArgs.length - 1)
    ) {
      throw new ApplicationError(
        `Invalid optionsArgIndex value ${optionsArgIndex} provided for DomainEntityService ${this.persistanceEntityService.getEntityName(true) || '(no entity name)'}.}.`
      );
    }
    for (const i in serviceNames) {
      const serviceName = serviceNames[i];
      const service = this.getPersistanceService(serviceName);
      if (!service) {
        throw new ApplicationError(
          `PersistanceEntityService ${serviceName} does not exist for DomainEntityService ${this.persistanceEntityService.getEntityName(true) || '(no entity name)'}.`
        );
      }
      const serviceMethodOptionsOverrides = optionsOverridesByService[serviceName] || {};
      const {
        filterByFirstServiceResultFields,
        runOnNoFirstServiceResultOnly = true,
        ...actualMethodOptionsOverrides
      } = serviceMethodOptionsOverrides;
      // be extra careful when working with persistance that has TTL as the main service,
      // since there is no way to check for limited results here.
      if (
        (runOnNoFirstServiceResultOnly === true || runOnNoFirstServiceResultOnly === 'true') &&
        hasFirstServiceResult
      ) {
        continue;
      }
      const serviceMethodArgs = Immutable.fromJS(methodArgs).toJS();
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
      if (filterByFirstServiceResultFields && Object.keys(filterByFirstServiceResultFields).length) {
        if (!hasFirstServiceResult) {
          continue;
        }
        const filters: GenericObject = {};
        const resultItems: GenericObject[] = (firstServiceResult as { items?: GenericObject[] }).items || [
          firstServiceResult as GenericObject
        ];
        resultItems.forEach(resultItem => {
          if (!resultItem) {
            return;
          }
          for (const sourceFieldName in filterByFirstServiceResultFields) {
            const fieldValue = resultItem[sourceFieldName];
            const targetFieldName = filterByFirstServiceResultFields[sourceFieldName];
            if (typeof fieldValue === 'undefined') {
              return;
            }
            if (!filters[targetFieldName]) {
              filters[targetFieldName] = [];
            }
            (filters[targetFieldName] as unknown[]).push(fieldValue);
          }
        });
        if (Object.keys(filters).length) {
          const serviceMethodOptions = serviceMethodArgs[optionsArgIndex!] as GenericObject & {
            filters?: GenericObject;
          };
          serviceMethodArgs[optionsArgIndex!] = {
            ...serviceMethodOptions,
            filters: {
              ...omit(['page', 'perPage'], serviceMethodOptions.filters || {}),
              ...filters
            },
            findAll: true
          };
        }
      }
      returnDataByService[serviceName] = (await (
        service[methodName as keyof PersistanceEntityService<Entity>] as unknown as (
          ..._args: unknown[]
        ) => Promise<ServiceReturnData>
      ).apply(service, serviceMethodArgs)) as ServiceReturnData;
    }
    return returnDataByService;
  }

  public update(
    // eslint-disable-next-line no-unused-vars
    data: Data['Update'],
    // eslint-disable-next-line no-unused-vars
    options: DomainUpdateOptions,
    // eslint-disable-next-line no-unused-vars
    privateOptions?: DomainUpdatePrivateOptions
  ): Promise<DomainUpdateResult<Entity>>;
  async update(
    data: Data['Update'],
    options: DomainUpdateOptions,
    privateOptions?: DomainUpdatePrivateOptions
  ): Promise<DomainUpdateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Update)) {
      throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
    }
    const {
      optionsOverridesByService,
      persistanceServices = [DomainPersistanceEntityServiceType.Main],
      ...otherOptions
    } = options;
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).update(data, otherOptions, privateOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        firstServiceResult: result,
        hasFirstServiceResult: !!result.count,
        methodArgs: [data, otherOptions, privateOptions],
        methodName: 'update',
        optionsArgIndex: 1,
        optionsOverridesByService
      })
    };
  }
}
