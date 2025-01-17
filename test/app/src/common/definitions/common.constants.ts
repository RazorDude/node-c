export enum Constants {}

export const domainMap: {
  [key: string]: { domain: string; secure: boolean; sameSite: boolean | 'lax' | 'strict' | 'none' };
} = {
  'http://localhost:3000': { domain: 'localhost', secure: false, sameSite: 'lax' },
  'https://admin.dev.node-c.com': { domain: '.dev.node-c.com', secure: true, sameSite: 'none' },
  'https://admin.staging.node-c.com': { domain: '.staging.node-c.com', secure: true, sameSite: 'none' },
  'https://admin.node-c.com': { domain: '.node-c.com', secure: true, sameSite: 'none' }
};
