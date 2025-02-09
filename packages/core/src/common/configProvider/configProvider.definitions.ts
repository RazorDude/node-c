import { GenericObject } from '../definitions';

/*
 * This object contains the names of the fields within the modules, by module category.
 */
export const APP_CONFIG_FROM_ENV_KEYS: AppConfigFromEnvKeys = {
  API: {
    HTTP: {
      HOSTNAME: 'hostname',
      PORT: 'port'
    },
    REST: {
      HOSTNAME: 'hostname',
      PORT: 'port'
    }
  },
  DOMAIN: {
    IAM: {
      JWT_ACCESS_SECRET: 'jwtAccessSecret',
      JWT_REFRESH_SECRET: 'jwtRefreshSecret'
    }
  },
  PERSISTANCE: {
    NOSQL: {
      HOST: 'host',
      PASSWORD: 'password',
      PORT: 'port',
      USER: 'user'
    },
    RDB: {
      HOST: 'host',
      PASSWORD: 'password',
      PORT: 'port',
      USER: 'user'
    }
  }
};

/*
 * This object contains the names of the module categories and the modules themselves.
 * The module names here are examples, corresponding to the object above.
 * In order for this to work, each module in the .env files should have a key ending with
 * _MODULE_TYPE, whose value correesponds to the values define in the 'children' here.
 */
export const APP_CONFIG_FROM_ENV_KEYS_PARENT_NAMES: AppConfigFromEnvKeysParentNames = {
  API: {
    children: {
      HTTP: 'http',
      REST: 'rest'
    },
    name: 'api'
  },
  DOMAIN: {
    children: {
      IAM: 'iam'
    },
    name: 'domain'
  },
  PERSISTANCE: {
    children: {
      DB: 'db',
      REDIS: 'redis'
    },
    name: 'persistance'
  }
};

type AppConfigIntermediate = AppConfigCommon & AppConfigProfile & AppConfigFromEnv;
export type AppConfig = AppConfigIntermediate & Required<Pick<AppConfigIntermediate, 'api'>>;
type AppConfigAPIHTTPIntermediate = AppConfigCommonAPIHTTP & AppConfigFromEnvAPIHTTP;
export type AppConfigAPIHTTP = AppConfigAPIHTTPIntermediate &
  Required<Pick<AppConfigAPIHTTPIntermediate, 'allowedOrigins' | 'anonymousAccessRoutes' | 'hostname' | 'port'>>;
export type AppConfigAPIREST = AppConfigCommonAPIREST & AppConfigFromEnvAPIREST;
export type AppConfigDomainIAM = AppConfigCommonDomainIAM & AppConfigFromEnvDomainIAM;
export type AppConfigPersistanceNoSQL = AppConfigCommonPersistanceNoSQL & AppConfigFromEnvPersistanceNoSQL;
export type AppConfigPersistanceRDB = AppConfigCommonPersistanceRDB & AppConfigFromEnvPersistanceRDB;

/*
 * Config data held in the common config file.
 */

export interface AppConfigCommon {
  api?: { [apiName: string]: GenericObject | AppConfigCommonAPIHTTP | AppConfigCommonAPIREST };
  domain: { [domainName: string]: GenericObject | AppConfigCommonDomainIAM };
  general: {
    projectName: string;
    projectRootPath: string;
    projectVersion: string;
  };
  persistance: {
    [moduleName: string]: GenericObject | AppConfigCommonPersistanceNoSQL | AppConfigCommonPersistanceRDB;
  };
}

export interface AppConfigCommonAPIHTTP {
  allowedOrigins?: string[];
  anonymousAccessRoutes?: string[];
  hostname?: string;
  port?: number;
}
export type AppConfigCommonAPIREST = AppConfigCommonAPIHTTP;

export interface AppConfigCommonDomainIAM {
  accessTokenExpiryTimeInMinutes?: number;
  refreshTokenExpiryTimeInMinutes?: number;
}

export interface AppConfigCommonPersistanceNoSQL {
  type: NoSQLType;
}

export interface AppConfigCommonPersistanceRDB {
  type: RDBType;
}

/*
 * Config data coming from env files.
 */

export interface AppConfigFromEnv {
  api?: { [apiName: string]: GenericObject | AppConfigFromEnvAPIHTTP | AppConfigFromEnvAPIREST };
  domain?: { [domainName: string]: GenericObject | AppConfigFromEnvDomainIAM };
  persistance?: {
    [moduleName: string]: GenericObject | AppConfigFromEnvPersistanceNoSQL | AppConfigFromEnvPersistanceRDB;
  };
}

export type AppConfigFromEnvAPIHTTP = AppConfigCommonAPIHTTP;
export type AppConfigFromEnvAPIREST = AppConfigFromEnvAPIHTTP;

export interface AppConfigFromEnvDomainIAM {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}

export interface AppConfigFromEnvKeys {
  [moduleCategory: string]: {
    [moduleType: string]: Record<string, string>;
  };
}

export interface AppConfigFromEnvKeysParentNames {
  [moduleCategory: string]: {
    children: Record<string, string>;
    name: string;
  };
}

export interface AppConfigFromEnvPersistanceNoSQL {
  host: string;
  password: string;
  port: number;
  user?: string;
}

export interface AppConfigFromEnvPersistanceRDB {
  host: string;
  password: string;
  port: number;
  user: string;
}

/*
 * Config data coming from configProfile files.
 */

export interface AppConfigProfile {
  api?: { [apiName: string]: GenericObject | AppConfigProfileAPIHTTP | AppConfigProfileAPIREST };
  domain?: { [domainName: string]: GenericObject | AppConfingProfileDomainIAM };
  general: {
    environment: AppEnvironment;
    projectName?: string;
    projectVersion?: string;
  };
}

export type AppConfigProfileAPIHTTP = AppConfigCommonAPIHTTP;
export type AppConfigProfileAPIREST = AppConfigProfileAPIHTTP;

export interface AppConfingProfileDomainIAM {
  accessTokenExpiryTimeInMinutes?: number;
  refreshTokenExpiryTimeInMinutes?: number;
}

export enum AppEnvironment {
  // eslint-disable-next-line no-unused-vars
  Development = 'development',
  // eslint-disable-next-line no-unused-vars
  Local = 'local',
  // eslint-disable-next-line no-unused-vars
  Production = 'production',
  // eslint-disable-next-line no-unused-vars
  Staging = 'staging'
}

/*
 * Other config-related definitions.
 */

export interface ConfigProviderModuleOptions {
  appConfigs: LoadConfigAppConfigs;
  envKeys: AppConfigFromEnvKeys;
  envKeysParentNames: AppConfigFromEnvKeysParentNames;
}

export interface GenerateOrmconfigOptions {
  entitiesPathInModule: string;
  migrationsPathInModule: string;
  moduleName: string;
  modulePathInProject: string;
}

// TODO: figure out how to move this to the Redis package
export enum NoSQLType {
  // eslint-disable-next-line no-unused-vars
  Redis = 'redis'
}

// TODO: figure out how to move this to the RDB package
export enum RDBType {
  // eslint-disable-next-line no-unused-vars
  Clickhouse = 'clickhouse',
  // eslint-disable-next-line no-unused-vars
  MySQL = 'mysql',
  // eslint-disable-next-line no-unused-vars
  PG = 'pg'
}

export type LoadConfigAppConfigs<
  AppConfigCommonType extends AppConfigCommon = AppConfigCommon,
  AppConfigProfileType extends AppConfigProfile = AppConfigProfile
> =
  | {
      appConfigCommon: AppConfigCommonType;
    }
  | GenericObject<AppConfigProfileType>;

export interface LoadConfigOptions {
  envKeys?: AppConfigFromEnvKeys;
  envKeysParentNames?: AppConfigFromEnvKeysParentNames;
}
