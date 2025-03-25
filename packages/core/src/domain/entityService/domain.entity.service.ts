import {
  DomainBulkCreateData,
  DomainBulkCreateOptions,
  DomainBulkCreateResult,
  DomainCreateData,
  DomainCreateOptions,
  DomainCreateResult,
  DomainDeleteOptions,
  DomainDeleteResult,
  DomainFindOneOptions,
  DomainFindOneResult,
  DomainFindOptions,
  DomainFindResult,
  DomainMethod,
  DomainPersistanceEntityServiceType,
  DomainUpdateData,
  DomainUpdateOptions,
  DomainUpdateResult
} from './domain.entity.service.definitions';

import { ApplicationError, GenericObject } from '../../common/definitions';

import { PersistanceEntityService } from '../../persistance/entityService';

// TODO: persist in the main sevice on main service miss & find/findOne additional service(s)
export class DomainEntityService<
  Entity,
  EntityService extends PersistanceEntityService<Entity>,
  Data extends {
    BulkCreate: DomainBulkCreateData<Entity>;
    Create: DomainCreateData<Entity>;
    Update: DomainUpdateData<Entity>;
  } = {
    BulkCreate: DomainBulkCreateData<Entity>;
    Create: DomainCreateData<Entity>;
    Update: DomainUpdateData<Entity>;
  },
  AdditionalEntityServices extends Record<string, PersistanceEntityService<Entity>> | undefined = undefined
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: EntityService,
    // eslint-disable-next-line no-unused-vars
    protected additionalPersistanceEntityServices?: AdditionalEntityServices,
    // eslint-disable-next-line no-unused-vars
    protected defaultMethods: string[] = [
      DomainMethod.BulkCreate,
      DomainMethod.Create,
      DomainMethod.Delete,
      DomainMethod.Find,
      DomainMethod.FindOne,
      DomainMethod.Update
    ]
  ) {}

  public bulkCreate(
    // eslint-disable-next-line no-unused-vars
    data: Data['BulkCreate'],
    // eslint-disable-next-line no-unused-vars
    options?: DomainBulkCreateOptions
  ): Promise<DomainBulkCreateResult<Entity>>;
  async bulkCreate(
    data: Data['BulkCreate'],
    options?: DomainBulkCreateOptions
  ): Promise<DomainBulkCreateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.BulkCreate)) {
      throw new ApplicationError(`Method bulkCreate not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main] } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).bulkCreate(data);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [result],
        methodName: 'bulkCreate'
      })
    };
  }

  // eslint-disable-next-line no-unused-vars
  public create(data: Data['Create'], options?: DomainCreateOptions): Promise<DomainCreateResult<Entity>>;
  async create(data: Data['Create'], options?: DomainCreateOptions): Promise<DomainCreateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Create)) {
      throw new ApplicationError(`Method create not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main] } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).create(data);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [result],
        methodName: 'create'
      })
    };
  }

  // eslint-disable-next-line no-unused-vars
  public delete(options: DomainDeleteOptions): Promise<DomainDeleteResult>;
  async delete(options: DomainDeleteOptions): Promise<DomainDeleteResult> {
    if (!this.defaultMethods?.includes(DomainMethod.Delete)) {
      throw new ApplicationError(`Method delete not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main], ...otherOptions } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).delete(otherOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [otherOptions],
        methodName: 'delete'
      })
    };
  }

  // eslint-disable-next-line no-unused-vars
  public find(options: DomainFindOptions): Promise<DomainFindResult<Entity>>;
  async find(options: DomainFindOptions): Promise<DomainFindResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Find)) {
      throw new ApplicationError(`Method find not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main], ...otherOptions } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).find(otherOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [otherOptions],
        methodName: 'find'
      })
    };
  }

  // eslint-disable-next-line no-unused-vars
  public findOne(options: DomainFindOneOptions): Promise<DomainFindOneResult<Entity>>;
  async findOne(options: DomainFindOneOptions): Promise<DomainFindOneResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.FindOne)) {
      throw new ApplicationError(`Method findOne not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main], ...otherOptions } = options || {};
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).findOne(otherOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [otherOptions],
        methodName: 'findOne'
      })
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
        `PersistanceEntityService ${serviceName} does not exist for DomainEntityService ${this.persistanceEntityService.getEntityName()}.`
      );
    }
    return service;
  }

  protected async runMethodInAdditionalServices<ServiceReturnData>(
    serviceNames: string[],
    options: { methodArgs?: unknown[]; methodName: string }
  ): Promise<GenericObject<ServiceReturnData> | undefined> {
    if (!serviceNames.length) {
      return undefined;
    }
    const { methodArgs = [], methodName } = options;
    const returnDataByService: GenericObject<ServiceReturnData> = {};
    if (!this.additionalPersistanceEntityServices) {
      throw new ApplicationError(
        `No additional PersistanceEntityServices exist for DomainEntityService ${this.persistanceEntityService.getEntityName()}.`
      );
    }
    for (const i in serviceNames) {
      const serviceName = serviceNames[i];
      const service = this.additionalPersistanceEntityServices[serviceName];
      if (!service) {
        throw new ApplicationError(
          `PersistanceEntityService ${serviceName} does not exist for DomainEntityService ${this.persistanceEntityService.getEntityName()}.`
        );
      }
      returnDataByService[serviceName] = (await (
        service[methodName as keyof PersistanceEntityService<Entity>] as unknown as (
          ..._args: unknown[]
        ) => Promise<ServiceReturnData>
      ).apply(service, methodArgs)) as ServiceReturnData;
    }
    return returnDataByService;
  }

  // eslint-disable-next-line no-unused-vars
  public update(data: Data['Update'], options: DomainUpdateOptions): Promise<DomainUpdateResult<Entity>>;
  async update(data: Data['Update'], options: DomainUpdateOptions): Promise<DomainUpdateResult<Entity>> {
    if (!this.defaultMethods?.includes(DomainMethod.Update)) {
      throw new ApplicationError(`Method update not implemented for class ${typeof this}.`);
    }
    const { persistanceServices = [DomainPersistanceEntityServiceType.Main], ...otherOptions } = options;
    const [firstServiceName, ...otherServiceNames] = persistanceServices;
    const result = await this.getPersistanceService(firstServiceName).update(data, otherOptions);
    return {
      result,
      resultsByService: await this.runMethodInAdditionalServices(otherServiceNames || [], {
        methodArgs: [data, otherOptions],
        methodName: 'update'
      })
    };
  }
}
