export enum Constants {
  // eslint-disable-next-line no-unused-vars
  API_COURSE_PLATFORM_MODULE_NAME = 'coursePlatform',
  // eslint-disable-next-line no-unused-vars
  API_SSO_MODULE_NAME = 'sso',
  // eslint-disable-next-line no-unused-vars
  DOMAIN_IAM_MODULE_NAME = 'iam',
  // eslint-disable-next-line no-unused-vars
  DATA_AUDIT_MODULE_NAME = 'audit',
  // eslint-disable-next-line no-unused-vars
  DATA_CACHE_AUTH_MODULE_NAME = 'cacheAuth',
  // eslint-disable-next-line no-unused-vars
  DATA_CACHE_AUTH_STORE_KEY = 'store-cache-auth',
  // eslint-disable-next-line no-unused-vars
  DATA_CACHE_MODULE_NAME = 'cache',
  // eslint-disable-next-line no-unused-vars
  DATA_CACHE_STORE_KEY = 'store-cache',
  // eslint-disable-next-line no-unused-vars
  DATA_DB_CONFIGS_MODULE_CONNECTION_NAME = 'db_configs_connection',
  // eslint-disable-next-line no-unused-vars
  DATA_DB_CONFIGS_MODULE_NAME = 'dbConfigs',
  // eslint-disable-next-line no-unused-vars
  DATA_DB_MODULE_CONNECTION_NAME = 'db_connection',
  // eslint-disable-next-line no-unused-vars
  DATA_DB_MODULE_NAME = 'db'
}

export const domainMap: {
  [key: string]: { domain: string; secure: boolean; sameSite: boolean | 'lax' | 'strict' | 'none' };
} = {
  'http://localhost:2080': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'http://localhost:2090': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'https://dev.course-platform.node-c.com': { domain: '.dev.node-c.com', secure: true, sameSite: 'none' },
  'https://staging.course-platform.node-c.com': { domain: '.staging.node-c.com', secure: true, sameSite: 'none' },
  'https://course-platform.node-c.com': { domain: '.node-c.com', secure: true, sameSite: 'none' }
};
