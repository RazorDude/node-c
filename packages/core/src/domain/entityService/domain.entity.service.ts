import {
  DomainBulkCreateOptions,
  DomainBulkCreateResult,
  DomainCreateOptions,
  DomainCreateResult,
  DomainDeleteOptions,
  DomainDeleteResult,
  DomainFindOneOptions,
  DomainFindOneResult,
  DomainFindOptions,
  DomainFindResult,
  DomainPersistanceEntityServiceType,
  DomainUpdateOptions,
  DomainUpdateResult
} from './domain.entity.service.definitions';

import { ApplicationError, GenericObject } from '../../common/definitions';

import { PersistanceEntityService } from '../../persistance/entityService';

export class DomainEntityService<
  Entity,
  EntityService extends PersistanceEntityService<Entity>,
  AdditionalEntityServices extends Record<string, PersistanceEntityService<Entity>> | undefined = undefined
> {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected persistanceEntityService: EntityService,
    // eslint-disable-next-line no-unused-vars
    protected additionalPersistanceEntityServices?: AdditionalEntityServices
  ) {}

  public bulkCreate(
    // eslint-disable-next-line no-unused-vars
    data: Entity[] | GenericObject[],
    // eslint-disable-next-line no-unused-vars
    options?: DomainBulkCreateOptions
  ): Promise<DomainBulkCreateResult<Entity>>;
  async bulkCreate(data: Entity[], options?: DomainBulkCreateOptions): Promise<DomainBulkCreateResult<Entity>> {
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
  public create(data: Entity | GenericObject, options?: DomainCreateOptions): Promise<DomainCreateResult<Entity>>;
  async create(data: Entity, options?: DomainCreateOptions): Promise<DomainCreateResult<Entity>> {
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
  public update(data: Entity | GenericObject, options: DomainUpdateOptions): Promise<DomainUpdateResult<Entity>>;
  async update(data: Entity, options: DomainUpdateOptions): Promise<DomainUpdateResult<Entity>> {
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
