import { GenericObject } from '../definitions';

/*
 * This object contains the names of the fields within the modules, by module category.
 */
export const APP_CONFIG_FROM_ENV_KEYS: AppConfigFromEnvKeys = {
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
 */
export const APP_CONFIG_FROM_ENV_KEYS_PARENT_NAMES: AppConfigFromEnvKeysParentNames = {
  DOMAIN: {
    children: {
      IAM: 'iam' // type - IAM
    },
    name: 'domain'
  },
  PERSISTANCE: {
    children: {
      DB: 'db', // type - RDB
      REDIS: 'redis' // type - NOSQL
    },
    name: 'persistance'
  }
};

export type AppConfig = AppConfigCommon & AppConfigProfile & AppConfigFromEnv;
export type AppConfigDomainIAM = AppConfigCommonDomainIAM & AppConfigFromEnvDomainIAM;
export type AppConfigPersistanceNoSQL = AppConfigCommonPersistanceNoSQL & AppConfigFromEnvPersistanceNoSQL;
export type AppConfigPersistanceRDB = AppConfigCommonPersistanceRDB & AppConfigFromEnvPersistanceRDB;

/*
 * Config data held in the common config file.
 */

export interface AppConfigCommon {
  api: {
    [apiName: string]: {
      anonymousRoutes?: string[];
    };
  };
  domain: { [domainName: string]: GenericObject | AppConfigCommonDomainIAM };
  general: {
    projectName: string;
    projectVersion: string;
  };
  persistance: {
    [moduleName: string]: GenericObject | AppConfigCommonPersistanceNoSQL | AppConfigCommonPersistanceRDB;
  };
}

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
  domain?: { [domainName: string]: GenericObject | AppConfigCommonDomainIAM };
  persistance?: {
    [moduleName: string]: GenericObject | AppConfigFromEnvPersistanceNoSQL | AppConfigFromEnvPersistanceRDB;
  };
}

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
  api?: {
    [apiName: string]:
      | GenericObject
      | {
          allowedOrigins: string[];
          anonymousRoutes?: string[];
          hostname: string;
          port: number;
        };
  };
  domain?: { [domainName: string]: GenericObject | AppConfingProfileDomainIAM };
  general: {
    environment: AppEnvironment;
    projectName?: string;
    projectVersion?: string;
  };
}

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
  entitiesBasePath: string;
  migrationsPath: string;
}

export enum NoSQLType {
  // eslint-disable-next-line no-unused-vars
  Redis = 'redis'
}

export enum RDBType {
  // eslint-disable-next-line no-unused-vars
  MySQL = 'mysql',
  // eslint-disable-next-line no-unused-vars
  PG = 'pg'
}

export type LoadConfigAppConfigs<
  AppConfigCommonType extends AppConfigCommon = AppConfigCommon,
  AppConfigProfileType extends AppConfigProfile = AppConfigProfile
> = {
  appConfigCommon: AppConfigCommonType;
} & GenericObject<AppConfigProfileType>;

export interface LoadConfigOptions {
  envKeys?: AppConfigFromEnvKeys;
  envKeysParentNames?: AppConfigFromEnvKeysParentNames;
}
