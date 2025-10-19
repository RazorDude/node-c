import { GenericObject } from '../../common/definitions';

import {
  PersistanceBulkCreatePrivateOptions,
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
  PersistanceUpdateResult
} from '../../persistance/entityService';

export interface DomainBaseAdditionalServiceOptionsOverrides {
  filterByFirstServiceResultFields?: GenericObject<string>;
  returnData?: boolean;
  runOnNoFirstServiceResultOnly?: boolean | string;
}

export type DomainBaseOptions<Options> = Options & DomainBaseOptionsForAdditionalServices<Options>;

export interface DomainBaseOptionsForAdditionalServices<Options> {
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
  persistanceServices?: DomainPersistanceServicesKey[];
}

export type DomainBaseOptionsForAdditionalServicesFull<
  Options extends object | undefined = undefined,
  SaveAdditionalResultsOptions extends object | undefined = undefined
> = DomainBaseOptionsForAdditionalServices<Options> &
  DomainBaseOptionsWithSearchPersistance<SaveAdditionalResultsOptions>;

export interface DomainBaseOptionsWithSearchPersistance<
  SaveAdditionalResultsOptions extends object | undefined = undefined
> {
  saveAdditionalResultsInFirstService?: {
    saveOptions?: SaveAdditionalResultsOptions;
    serviceName: string;
    useResultsForFirstService?: boolean;
  };
}

export interface DomainBaseResult<Result> {
  result: Result;
  resultsByService?: GenericObject<Result>;
}

export type DomainBulkCreatePrivateOptions = PersistanceBulkCreatePrivateOptions;

export type DomainBulkCreateData<Entity> = Partial<Entity>[];

export type DomainBulkCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainBulkCreateResult<Entity> = DomainBaseResult<Entity[]>;

export type DomainCreateData<Entity> = Partial<Entity>;

export type DomainCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainCreatePrivateOptions = PersistanceCreatePrivateOptions;

export type DomainCreateResult<Entity> = DomainBaseResult<Entity>;

export type DomainDeleteOptions<Options = object> = Options & DomainBaseOptions<PersistanceDeleteOptions>;

export type DomainDeletePrivateOptions = PersistanceDeletePrivateOptions;

export type DomainDeleteResult<Entity> = DomainBaseResult<PersistanceDeleteResult<Entity>>;

export interface DomainEntityServiceDefaultData<Entity> {
  BulkCreate: DomainBulkCreateData<Entity>;
  Create: DomainCreateData<Entity>;
  Update: DomainUpdateData<Entity>;
}

export type DomainFindOneOptions<Options = object> = Options &
  DomainBaseOptions<PersistanceFindOneOptions> &
  DomainBaseOptionsWithSearchPersistance<DomainCreateOptions>;

export type DomainFindOnePrivateOptions = PersistanceFindOnePrivateOptions;

export type DomainFindOneResult<Entity> = DomainBaseResult<Entity | null>;

export type DomainFindOptions<Options = object> = Options &
  DomainBaseOptions<PersistanceFindOptions> &
  DomainBaseOptionsWithSearchPersistance<DomainBulkCreateOptions>;

export type DomainFindPrivateOptions = PersistanceFindPrivateOptions;

export type DomainFindResult<Entity> = DomainBaseResult<PersistanceFindResults<Entity>>;

export enum DomainMethod {
  // eslint-disable-next-line no-unused-vars
  BulkCreate = 'bulkCreate',
  // eslint-disable-next-line no-unused-vars
  Create = 'create',
  // eslint-disable-next-line no-unused-vars
  Delete = 'delete',
  // eslint-disable-next-line no-unused-vars
  Find = 'find',
  // eslint-disable-next-line no-unused-vars
  FindOne = 'findOne',
  // eslint-disable-next-line no-unused-vars
  Update = 'update'
}

export const DOMAIN_ENTITY_SERVICE_DEFAULT_METHODS = [
  DomainMethod.BulkCreate,
  DomainMethod.Create,
  DomainMethod.Delete,
  DomainMethod.Find,
  DomainMethod.FindOne,
  DomainMethod.Update
];

export enum DomainPersistanceEntityServiceType {
  // eslint-disable-next-line no-unused-vars
  All = 'all',
  // eslint-disable-next-line no-unused-vars
  Main = 'main'
}

export type DomainPersistanceServicesKey = DomainPersistanceEntityServiceType | string;

export type DomainRunMethodInAdditionalServicesOptions<Options> = {
  firstServiceResult?: unknown;
  hasFirstServiceResult: boolean;
  methodArgs?: unknown[];
  methodName: string;
  optionsArgIndex?: number;
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
};

export type DomainUpdateData<Entity> = Partial<Entity>;

export type DomainUpdateOptions<Options = object> = Options & DomainBaseOptions<PersistanceUpdateOptions>;

export type DomainUpdatePrivateOptions = PersistanceUpdatePrivateOptions;

export type DomainUpdateResult<Entity> = DomainBaseResult<PersistanceUpdateResult<Entity>>;
