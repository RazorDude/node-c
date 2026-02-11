import { GenericObject } from '../../common/definitions';

import {
  DataBulkCreatePrivateOptions,
  DataCreatePrivateOptions,
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
  DataUpdateResult
} from '../../data/entityService';

export interface DomainBaseAdditionalServiceOptionsOverrides {
  filterByFirstServiceResultFields?: GenericObject<string>;
  returnData?: boolean;
  runOnNoFirstServiceResultOnly?: boolean | string;
}

export type DomainBaseOptions<Options> = Options & DomainBaseOptionsForAdditionalServices<Options>;

export interface DomainBaseOptionsForAdditionalServices<Options> {
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
  dataServices?: DomainDataServicesKey[];
}

export type DomainBaseOptionsForAdditionalServicesFull<
  Options extends object | undefined = undefined,
  SaveAdditionalResultsOptions extends object | undefined = undefined
> = DomainBaseOptionsForAdditionalServices<Options> & DomainBaseOptionsWithSearchData<SaveAdditionalResultsOptions>;

export interface DomainBaseOptionsWithSearchData<SaveAdditionalResultsOptions extends object | undefined = undefined> {
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

export type DomainBulkCreatePrivateOptions = DataBulkCreatePrivateOptions;

export type DomainBulkCreateData<Entity> = Partial<Entity>[];

export type DomainBulkCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainBulkCreateResult<Entity> = DomainBaseResult<Entity[]>;

export type DomainCreateData<Entity> = Partial<Entity>;

export type DomainCreateOptions<Options = object> = DomainBaseOptions<Options>;

export type DomainCreatePrivateOptions = DataCreatePrivateOptions;

export type DomainCreateResult<Entity> = DomainBaseResult<Entity>;

export type DomainDeleteOptions<Options = object> = Options & DomainBaseOptions<DataDeleteOptions>;

export type DomainDeletePrivateOptions = DataDeletePrivateOptions;

export type DomainDeleteResult<Entity> = DomainBaseResult<DataDeleteResult<Entity>>;

export interface DomainEntityServiceDefaultData<Entity> {
  BulkCreate: DomainBulkCreateData<Entity>;
  Create: DomainCreateData<Entity>;
  Update: DomainUpdateData<Entity>;
}

export type DomainFindOneOptions<Options = object> = Options &
  DomainBaseOptions<DataFindOneOptions> &
  DomainBaseOptionsWithSearchData<DomainCreateOptions>;

export type DomainFindOnePrivateOptions = DataFindOnePrivateOptions;

export type DomainFindOneResult<Entity> = DomainBaseResult<Entity | null>;

export type DomainFindOptions<Options = object> = Options &
  DomainBaseOptions<DataFindOptions> &
  DomainBaseOptionsWithSearchData<DomainBulkCreateOptions>;

export type DomainFindPrivateOptions = DataFindPrivateOptions;

export type DomainFindResult<Entity> = DomainBaseResult<DataFindResults<Entity>>;

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

export enum DomainDataEntityServiceType {
  // eslint-disable-next-line no-unused-vars
  All = 'all',
  // eslint-disable-next-line no-unused-vars
  Main = 'main'
}

export type DomainDataServicesKey = DomainDataEntityServiceType | string;

export type DomainRunMethodInAdditionalServicesOptions<Options> = {
  firstServiceResult?: unknown;
  hasFirstServiceResult: boolean;
  methodArgs?: unknown[];
  methodName: string;
  optionsArgIndex?: number;
  optionsOverridesByService?: GenericObject<Partial<Options> & DomainBaseAdditionalServiceOptionsOverrides>;
};

export type DomainUpdateData<Entity> = Partial<Entity>;

export type DomainUpdateOptions<Options = object> = Options & DomainBaseOptions<DataUpdateOptions>;

export type DomainUpdatePrivateOptions = DataUpdatePrivateOptions;

export type DomainUpdateResult<Entity> = DomainBaseResult<DataUpdateResult<Entity>>;
