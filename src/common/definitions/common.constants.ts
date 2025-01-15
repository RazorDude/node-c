export enum Constants {
  // eslint-disable-next-line no-unused-vars
  API_MODULE_ACP = 'API_MODULE_ACP',
  // eslint-disable-next-line no-unused-vars
  API_MODULE_AUTHENTICATION_IAM_MODULE_NAME = 'API_MODULE_AUTHENTICATION_IAM_MODULE_NAME',
  // eslint-disable-next-line no-unused-vars
  API_MODULE_AUTHENTICATION_USER_DATA_SERVICE = 'API_MODULE_AUTHENTICATION_USER_DATA_SERVICE',
  // eslint-disable-next-line no-unused-vars
  API_MODULE_NAME = 'API_MODULE_NAME',
  // eslint-disable-next-line no-unused-vars
  AUTHORIZATION_INTERCEPTOR = 'AUTHORIZATION_INTERCEPTOR',
  // eslint-disable-next-line no-unused-vars
  CONFIG = 'CONFIG',
  // eslint-disable-next-line no-unused-vars
  DOMAIN_MODULE_NAME = 'DOMAIN_MODULE_NAME',
  // eslint-disable-next-line no-unused-vars
  ERROR_INTERCEPTOR = 'ERROR_INTERCEPTOR',
  // eslint-disable-next-line no-unused-vars
  HTTP_EXCEPTION_FILTER = 'HTTP_EXCEPTION_FILTER',
  // eslint-disable-next-line no-unused-vars
  REDIS_CLIENT = 'REDIS_CLIENT',
  // eslint-disable-next-line no-unused-vars
  REDIS_CLIENT_STORE_KEY = 'REDIS_CLIENT_STORE_KEY',
  // eslint-disable-next-line no-unused-vars
  REDIS_REPOSITORY_SCHEMA = 'REDIS_REPOSITORY_SCHEMA',
  // eslint-disable-next-line no-unused-vars
  SQL_BUILDER_DB_CONFIG_PATH = 'SQL_BUILDER_DB_CONFIG_PATH'
}

// TODO: move the type definition to definitions and the values to the test app
export const domainMap: {
  [key: string]: { domain: string; secure: boolean; sameSite: boolean | 'lax' | 'strict' | 'none' };
} = {
  'http://localhost:3000': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'https://admin.dev.node-c.com': { domain: '.dev.node-c.com', secure: true, sameSite: 'none' },
  'https://admin.staging.node-c.com': { domain: '.staging.node-c.com', secure: true, sameSite: 'none' },
  'https://admin.node-c.com': { domain: '.node-c.com', secure: true, sameSite: 'none' }
};
