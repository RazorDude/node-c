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

export type DomainBaseOptions<Options> = Options & {
  optionsOverridesByService?: GenericObject<Partial<Options>>;
  persistanceServices?: DomainPersistanceServicesKey[];
};

export interface DomainBaseResult<Result> {
  result: Result;
  resultsByService?: GenericObject<Result>;
}

export type DomainBulkCreateOptions = Omit<DomainBaseOptions<object>, 'optionsOverridesByService'>;

export type DomainBulkCreateResult<Entity> = DomainBaseResult<Entity[]>;

export type DomainCreateOptions = Omit<DomainBaseOptions<object>, 'optionsOverridesByService'>;

export type DomainCreateResult<Entity> = DomainBaseResult<Entity>;

export type DomainDeleteOptions = DomainBaseOptions<PersistanceDeleteOptions>;

export type DomainDeleteResult = DomainBaseResult<PersistanceDeleteResult>;

export type DomainFindOneOptions = DomainBaseOptions<PersistanceFindOneOptions>;

export type DomainFindOneResult<Entity> = DomainBaseResult<Entity | null>;

export type DomainFindOptions = DomainBaseOptions<PersistanceFindOptions>;

export type DomainFindResult<Entity> = DomainBaseResult<PersistanceFindResults<Entity>>;

export enum DomainPersistanceEntityServiceType {
  // eslint-disable-next-line no-unused-vars
  All = 'all',
  // eslint-disable-next-line no-unused-vars
  Main = 'main'
}

export type DomainPersistanceServicesKey = DomainPersistanceEntityServiceType | string;

export type DomainUpdateOptions = DomainBaseOptions<PersistanceUpdateOptions>;

export type DomainUpdateResult<Entity> = DomainBaseResult<PersistanceUpdateResult<Entity>>;
