export const Constants = {
  API_COURSE_PLATFORM_MODULE_NAME: 'coursePlatform',
  API_SSO_MODULE_NAME: 'sso',
  DATA_AUDIT_MODULE_NAME: 'audit',
  DATA_CACHE_AUTH_MODULE_NAME: 'cacheAuth',
  DATA_CACHE_AUTH_STORE_KEY: 'store-cache-auth',
  DATA_CACHE_MODULE_NAME: 'cache',
  DATA_CACHE_STORE_KEY: 'store-cache',
  DATA_DB_CONFIGS_MODULE_CONNECTION_NAME: 'db_configs_connection',
  DATA_DB_CONFIGS_MODULE_NAME: 'dbConfigs',
  DATA_DB_MODULE_CONNECTION_NAME: 'db_connection',
  DATA_DB_MODULE_NAME: 'db',
  DOMAIN_COURSE_PLATFORM_AUTH_OKTA_CONSUMER_SERVICE_NAME: 'oktaConsumer',
  DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME: 'oktaStandalone',
  DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_CONSUMER_SERVICE_NAME: 'userLocalConsumer',
  DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME: 'userLocalStandalone',
  DOMAIN_COURSE_PLATFORM_MODULE_NAME: 'coursePlatform',
  DOMAIN_COURSE_PLATFORM_USER_MANAGER_SERVICE: 'domainCoursePlatformUserManagerService',
  DOMAIN_IAM_MODULE_NAME: 'iam',
  DOMAIN_IAM_AUTH_OKTA_SERVICE_NAME: 'okta',
  DOMAIN_IAM_AUTH_PASSTHROUGH_SERVICE_NAME: 'passthrough',
  DOMAIN_IAM_AUTH_USER_LOCAL_SERVICE_NAME: 'userLocal',
  DOMAIN_IAM_USER_MANAGER_SERVICE: 'domainIAMUserManagerService'
};

export const domainMap: {
  [key: string]: { domain: string; secure: boolean; sameSite: boolean | 'lax' | 'strict' | 'none' };
} = {
  'http://localhost:2080': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'http://localhost:2090': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'https://dev.course-platform.node-c.com': { domain: '.dev.node-c.com', secure: true, sameSite: 'none' },
  'https://staging.course-platform.node-c.com': { domain: '.staging.node-c.com', secure: true, sameSite: 'none' },
  'https://course-platform.node-c.com': { domain: '.node-c.com', secure: true, sameSite: 'none' }
};
