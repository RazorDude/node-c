import { GenericObject, HttpMethod } from '../definitions';

/*
 * This object contains the names of the fields within the modules, by module category.
 */
export const APP_CONFIG_FROM_ENV_KEYS: AppConfigFromEnvKeys = {
  API: {
    HTTP: {
      API_KEY: 'apiKey',
      API_SECRET: 'apiSecret',
      API_SECRET_ALGORITHM: 'apiSecretAlgorithm',
      HOSTNAME: 'hostname',
      PORT: 'port'
    },
    REST: {
      API_KEY: 'apiKey',
      API_SECRET: 'apiSecret',
      API_SECRET_ALGORITHM: 'apiSecretAlgorithm',
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
  DATA: {
    NOSQL: {
      HOST: 'host',
      PASSWORD: 'password',
      SENTINEL_PASSWORD: 'sentinelPassword',
      PORT: 'port',
      USER: 'user'
    },
    RDB: {
      DATABASE_NAME: 'database',
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
  DATA: {
    children: {
      DB: 'db',
      REDIS: 'redis',
      VALKEY: 'valkey'
    },
    name: 'data'
  }
};

type AppConfigIntermediate = AppConfigCommon & AppConfigProfile & AppConfigFromEnv;
export type AppConfig = AppConfigIntermediate & Required<Pick<AppConfigIntermediate, 'api'>>;
type AppConfigAPIHTTPIntermediate = AppConfigCommonAPIHTTP & AppConfigFromEnvAPIHTTP;
export type AppConfigAPIHTTP = AppConfigAPIHTTPIntermediate &
  Required<Pick<AppConfigAPIHTTPIntermediate, 'allowedOrigins' | 'anonymousAccessRoutes' | 'hostname' | 'port'>>;
export type AppConfigAPIREST = AppConfigCommonAPIREST & AppConfigFromEnvAPIREST;

export type AppConfigDomainIAM = AppConfigCommonDomainIAM & AppConfigFromEnvDomainIAM & AppConfigProfileDomainIAM;

export enum AppConfigDomainIAMAuthenticationStep {
  // eslint-disable-next-line no-unused-vars
  Complete = 'complete',
  // eslint-disable-next-line no-unused-vars
  Initiate = 'initiate'
}

export type AppConfigDataNoSQL = AppConfigCommonDataNoSQL & AppConfigFromEnvDataNoSQL & AppConfigProfileDataNoSQL;
export type AppConfigDataRDB = AppConfigCommonDataClickHouse &
  AppConfigCommonDataRDB &
  AppConfigCommonDataClickHouse &
  AppConfigFromEnvDataRDB &
  AppConfigProfileDataClickHouse &
  AppConfigProfileDataRDB;

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
  data: {
    [moduleName: string]:
      | GenericObject
      | AppConfigCommonDataClickHouse
      | AppConfigCommonDataNoSQL
      | AppConfigCommonDataRDB;
  };
}

export interface AppConfigCommonAPIHTTP {
  allowedOrigins?: string[];
  anonymousAccessRoutes?: Record<string, HttpMethod[]>;
  endpointSecurityMode?: EndpointSecurityMode;
  hostname?: string;
  port?: number;
}
export type AppConfigCommonAPIREST = AppConfigCommonAPIHTTP;

export interface AppConfigCommonDomainIAM {
  accessTokenExpiryTimeInMinutes?: number;
  authServiceSettings?: GenericObject<{
    secretKey?: {
      secretKeyHMACAlgorithm?: string;
    };
    oauth2?: {
      accessTokenAudiences?: string[];
      accessTokenEmailField?: string;
      accessTokenGrantUrl?: string;
      authorizationUrl?: string;
      codeChallengeMethod: string; // code_challenge_method
      defaultScope?: string;
      issuerUri?: string;
      redirectUri?: string; // redirect_uri
      verifyTokensLocally?: boolean;
    };
    processExternalTokensOnVerify?: boolean;
    steps: AppConfigCommonDomainIAMAuthServiceConfigStepSettings;
  }>;
  defaultUserIdentifierField: string;
  refreshTokenExpiryTimeInMinutes?: number;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigBaseStepSettings {
  findUser?: boolean;
  findUserBeforeAuth?: boolean;
  stepResultPublicFields?: string[];
  validWithoutUser?: boolean;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigCacheSettings {
  cacheFieldName: string;
  inputFieldName: string;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigCachePopulationSettings {
  data?: boolean | AppConfigCommonDomainIAMAuthServiceConfigCacheSettings[];
  options?: boolean | AppConfigCommonDomainIAMAuthServiceConfigCacheSettings[];
  result?: boolean | AppConfigCommonDomainIAMAuthServiceConfigCacheSettings[];
}

export interface AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettings {
  data?: AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettingsItem;
  options?: AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettingsItem;
  result?: AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettingsItem;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettingsItem {
  overwrite?: boolean;
  use: boolean;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings extends AppConfigCommonDomainIAMAuthServiceConfigBaseStepSettings {
  authReturnsTokens?: boolean;
  cache?: {
    settings: AppConfigCommonDomainIAMAuthServiceConfigCacheSettings;
    use?: AppConfigCommonDomainIAMAuthServiceConfigCacheUsageSettings;
  };
  createUser?: boolean;
  decodeReturnedTokens?: boolean;
  findUserInAuthResultBy?: { userFieldName: string; resultFieldName: string };
  useReturnedTokens?: boolean;
}

export interface AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings extends AppConfigCommonDomainIAMAuthServiceConfigBaseStepSettings {
  cache?: {
    populate?: AppConfigCommonDomainIAMAuthServiceConfigCachePopulationSettings;
    settings: AppConfigCommonDomainIAMAuthServiceConfigCacheSettings;
  };
}

export interface AppConfigCommonDomainIAMAuthServiceConfigStepSettings {
  [AppConfigDomainIAMAuthenticationStep.Complete]: AppConfigCommonDomainIAMAuthServiceConfigCompleteSettings;
  [AppConfigDomainIAMAuthenticationStep.Initiate]: AppConfigCommonDomainIAMAuthServiceConfigInitiateSettings;
}

export type AppConfigCommonData = {
  failOnConnectionError?: boolean;
  settingsPerEntity?: Record<string, AppConfigCommonDataEntityServiceSettings>;
} & AppConfigCommonDataEntityServiceSettings;

export interface AppConfigCommonDataEntityServiceSettings {
  processFiltersAllowedFieldsEnabled?: boolean;
  processInputAllowedFieldsEnabled?: boolean;
}

export interface AppConfigCommonDataClickHouse extends AppConfigCommonData {
  application?: string;
  requestTimeout?: number;
  type: RDBType;
  useHostParam?: boolean;
}

export interface AppConfigCommonDataNoSQL extends AppConfigCommonData {
  clusterMode?: boolean;
  defaultIndividualSearchEnabled?: boolean;
  defaultTTL?: number;
  sentinelMasterName?: string;
  sentinelMode?: boolean;
  sentinelRole?: 'master' | 'slave';
  storeDelimiter?: string;
  storeKey: string;
  settingsPerEntity?: Record<string, AppConfigCommonDataNoSQLEntityServiceSettings>;
  type: NoSQLType;
  useHashmap?: boolean;
  usePasswordForSentinelPassword?: boolean;
  validationSettings?: AppConfigCommonDataNoSQLValidationSettings;
}

export interface AppConfigCommonDataNoSQLEntityServiceSettings extends AppConfigCommonDataEntityServiceSettings {
  defaultIndividualSearchEnabled?: boolean;
  ttl?: number;
  validationSettings?: AppConfigCommonDataNoSQLValidationSettings;
}

export interface AppConfigCommonDataNoSQLValidationSettings {
  throwErrorOnExtraProperies?: boolean;
  isEnabled?: boolean;
  whitelistProperties?: boolean;
}

export interface AppConfigCommonDataRDB extends AppConfigCommonData {
  connectionName: string;
  type: RDBType;
}

/*
 * Config data coming from env files.
 */

export interface AppConfigFromEnv {
  api?: { [apiName: string]: GenericObject | AppConfigFromEnvAPIHTTP | AppConfigFromEnvAPIREST };
  domain?: { [domainName: string]: GenericObject | AppConfigFromEnvDomainIAM };
  data?: {
    [moduleName: string]: GenericObject | AppConfigFromEnvDataNoSQL | AppConfigFromEnvDataRDB;
  };
}

export interface AppConfigFromEnvAPIHTTP extends AppConfigCommonAPIHTTP {
  apiKey?: string;
  apiSecret?: string;
  apiSecretAlgorithm?: string;
}

export type AppConfigFromEnvAPIREST = AppConfigFromEnvAPIHTTP;

export interface AppConfigFromEnvDomainIAM {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  authServiceSettings?: GenericObject<{
    secretKey?: {
      hashingSecret?: string;
    };
    oauth2?: {
      clientId: string; // client_id
      clientSecret: string; // client_secret
    };
  }>;
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

export interface AppConfigFromEnvDataNoSQL {
  host: string;
  password: string;
  port: number;
  sentinelPassword?: string;
  user?: string;
}

export interface AppConfigFromEnvDataRDB {
  database: string;
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
  domain?: { [domainName: string]: GenericObject | AppConfigProfileDomainIAM };
  general: {
    environment: AppEnvironment;
    projectName?: string;
    projectVersion?: string;
  };
  data?: {
    [dataModuleName: string]:
      | GenericObject
      | AppConfigProfileDataClickHouse
      | AppConfigProfileDataNoSQL
      | AppConfigProfileDataRDB;
  };
}

export type AppConfigProfileAPIHTTP = AppConfigCommonAPIHTTP;
export type AppConfigProfileAPIREST = AppConfigProfileAPIHTTP;

export interface AppConfigProfileDomainIAM {
  accessTokenExpiryTimeInMinutes?: number;
  authServiceSettings?: GenericObject<{
    oauth2?: {
      accessTokenAudiences?: string[];
      accessTokenEmailField?: string;
      accessTokenGrantUrl?: string;
      authorizationUrl?: string;
      codeChallengeMethod: string; // code_challenge_method
      defaultScope?: string;
      issuerUri?: string;
      redirectUri?: string; // redirect_uri
      verifyTokensLocally?: boolean;
    };
    processExternalTokensOnVerify?: boolean;
  }>;
  refreshTokenExpiryTimeInMinutes?: number;
}

export type AppConfigProfileDataClickHouse = AppConfigCommonDataClickHouse & {
  protocol?: string;
};
export type AppConfigProfileDataNoSQL = AppConfigCommonDataNoSQL;
export type AppConfigProfileDataRDB = AppConfigCommonDataRDB & {
  typeormExtraOptions?: GenericObject;
};

export enum AppEnvironment {
  // eslint-disable-next-line no-unused-vars
  Development = 'development',
  // eslint-disable-next-line no-unused-vars
  Local = 'local',
  // eslint-disable-next-line no-unused-vars
  Production = 'production',
  // eslint-disable-next-line no-unused-vars
  Staging = 'staging',
  // eslint-disable-next-line no-unused-vars
  Test = 'endToEndTests'
}

/*
 * Other config-related definitions.
 */

export interface ConfigProviderModuleOptions extends LoadConfigOptions {
  appConfigs: LoadConfigAppConfigs;
}

// TODO: figure out how to move this to the Domain-IAM package
export enum EndpointSecurityMode {
  // eslint-disable-next-line no-unused-vars
  Lax = 'lax',
  // eslint-disable-next-line no-unused-vars
  Strict = 'strict'
}

export interface GenerateOrmconfigOptions {
  entitiesPathInModule: string;
  migrationsPathInModule: string;
  moduleName: string;
  modulePathInProject: string;
  seedsPathInModule?: string;
}

// TODO: figure out how to move this to the Redis package
export enum NoSQLType {
  // eslint-disable-next-line no-unused-vars
  Redis = 'redis',
  // eslint-disable-next-line no-unused-vars
  Valkey = 'valkey'
}

// TODO: figure out how to move this to the RDB package
export enum RDBType {
  // eslint-disable-next-line no-unused-vars
  Aurora = 'aurora',
  // eslint-disable-next-line no-unused-vars
  ClickHouse = 'clickhouse',
  // eslint-disable-next-line no-unused-vars
  MySQL = 'mysql',
  // eslint-disable-next-line no-unused-vars
  PG = 'postgres'
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
  envName?: AppEnvironment;
  useEnvFile?: boolean;
  useEnvFileWithPriority?: boolean;
}
