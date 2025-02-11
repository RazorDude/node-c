export enum Constants {
  // eslint-disable-next-line no-unused-vars
  API_ADMIN_MODULE_NAME = 'api-admin',
  // eslint-disable-next-line no-unused-vars
  PERSISTANCE_CACHE_MODULE_NAME = 'persitance-cache',
  // eslint-disable-next-line no-unused-vars
  PERSISTANCE_CACHE_MODULE_STORE_KEY = 'store-cache'
}

export const domainMap: {
  [key: string]: { domain: string; secure: boolean; sameSite: boolean | 'lax' | 'strict' | 'none' };
} = {
  'http://localhost:2080': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'https://dev.admin.node-c.com': { domain: '.dev.node-c.com', secure: true, sameSite: 'none' },
  'https://staging.admin.node-c.com': { domain: '.staging.node-c.com', secure: true, sameSite: 'none' },
  'https://admin.node-c.com': { domain: '.node-c.com', secure: true, sameSite: 'none' }
};
