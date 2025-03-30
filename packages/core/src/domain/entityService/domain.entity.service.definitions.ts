import { GenericObject } from '../../common/definitions';

import {
  PersistanceDeleteOptions,
  PersistanceDeleteResult,
  PersistanceFindOneOptions,
  PersistanceFindOptions,
  PersistanceFindResults,
  PersistanceUpdateOptions,
  PersistanceUpdateResult
} from '../../persistance/entityService';

export interface DomainBaseAdditionalServiceOptionsOverrides {
  runOnNoMainServiceResultOnly?: boolean;
}

export type DomainBaseOptions<Options> = Options & {
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
  persistanceServices?: DomainPersistanceServicesKey[];
};

export interface DomainBaseOptionsWithSearchPersistance<
  SaveAdditionalResultsOptions extends object | undefined = undefined
> {
  saveAdditionalResultsInMain?: {
    saveOptions?: SaveAdditionalResultsOptions;
    serviceName: string;
    useResultsAsMain?: boolean;
  };
}

export interface DomainBaseResult<Result> {
  result: Result;
  resultsByService?: GenericObject<Result>;
}

export type DomainBulkCreateData<Entity> = Partial<Entity>[];

export type DomainBulkCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainBulkCreateResult<Entity> = DomainBaseResult<Entity[]>;

export type DomainCreateData<Entity> = Partial<Entity>;

export type DomainCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainCreateResult<Entity> = DomainBaseResult<Entity>;

export type DomainDeleteOptions<Options = object> = Options & DomainBaseOptions<PersistanceDeleteOptions>;

export type DomainDeleteResult = DomainBaseResult<PersistanceDeleteResult>;

export interface DomainEntityServiceDefaultData<Entity> {
  BulkCreate: DomainBulkCreateData<Entity>;
  Create: DomainCreateData<Entity>;
  Update: DomainUpdateData<Entity>;
}

export type DomainFindOneOptions<Options = object> = Options &
  DomainBaseOptions<PersistanceFindOneOptions> &
  DomainBaseOptionsWithSearchPersistance<DomainCreateOptions>;

export type DomainFindOneResult<Entity> = DomainBaseResult<Entity | null>;

export type DomainFindOptions<Options = object> = Options &
  DomainBaseOptions<PersistanceFindOptions> &
  DomainBaseOptionsWithSearchPersistance<DomainBulkCreateOptions>;

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

export enum DomainPersistanceEntityServiceType {
  // eslint-disable-next-line no-unused-vars
  All = 'all',
  // eslint-disable-next-line no-unused-vars
  Main = 'main'
}

export type DomainPersistanceServicesKey = DomainPersistanceEntityServiceType | string;

export type DomainRunMethodInAdditionalServicesOptions<Options> = {
  hasMainServiceResult: boolean;
  methodArgs?: unknown[];
  methodName: string;
  optionsArgIndex?: number;
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
};

export type DomainUpdateData<Entity> = Partial<Entity>;

export type DomainUpdateOptions<Options = object> = Options & DomainBaseOptions<PersistanceUpdateOptions>;

export type DomainUpdateResult<Entity> = DomainBaseResult<PersistanceUpdateResult<Entity>>;
