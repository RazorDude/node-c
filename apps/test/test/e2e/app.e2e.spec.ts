/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
const BASE_URL_SSO = 'http://localhost:2081';

interface TestCourse {
  categoryId: number | null;
  courseTypeId: number;
  id: number;
  name: string;
}

// userId is a 64-bit integer in ClickHouse, so it may be returned as a string
interface TestUserLoginLog {
  datetime: string;
  userId: number | string;
}

// Course Platform (Delegated) only;
// TODO: allowed relations fields parsing
// TODO: redis - array-based and object-based storage with interal primary keys, hashmap methods
// TODO: refresh token flow
// TODO: oauth2 auth, okta auth
// TODO: sentinel and cluster suites
// TODO: valkey - full suites (same as redis)
// TODO: other apps' suites
describe('NodeC.Apps.Test.CoursePlatformDelegated', () => {
  let adminAccessToken = '';
  let adminLoginLogs: TestUserLoginLog[] = [];
  let adminUserId = 0;
  let user0AccessToken = '';
  let user0Id = 0;
  let user0LoginLogs: TestUserLoginLog[] = [];
  // ----
  // -- start of general checks
  // ----
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch(BASE_URL_SSO);
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  it('should return an error with status 401 when calling non-implemented routes', async () => {
    const response = await fetch(`${BASE_URL_SSO}/tokens`);
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  // TODO: make sure query params are ignored in the originalUrl
  // throw a bad request error when trying to issue an access token without the auth field (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token without the auth field (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('auth should not be null or undefined');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // throw a bad request error when trying to issue an access token with an empty email filter (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token with an empty email filter (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' },
        filters: { email: '' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('filters.email should not be empty');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // throw a bad request error when trying to issue an access token with a non-string password (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token with a non-string password (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 12345 },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('auth.password must be a string');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an email that doesn't exist
  it("should fail to issue an access token for an email that doesn't exist", async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' },
        filters: { email: 'nobody@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email with a wrong password
  it('should fail to issue an access token for an existing email with a wrong password', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'WrongPassword' },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email with another user's password
  it("should fail to issue an access token for an existing email with another user's password", async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'User0Password' },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email without a password
  it('should fail to issue an access token for an existing email without a password', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: {},
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token without an email filter
  it('should fail to issue an access token without an email filter', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // ----
  // -- end of general checks
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - login and single-service find
  // ----
  // log in as admin
  it('should log the admin user in successfully', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: {
          password: 'AdminPassword'
        },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    adminAccessToken = responseBody.accessToken;
  });
  // TODO: non-enabled default routes
  // return no results if no users are found with the provided filters
  it('should return no results if no users are found with the provided filters', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id]=0`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(0);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // find users in the DB (no options)
  it('should find users in the DB (no options)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 5; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (pagination, page 1 - implicitly set)
  it('should find users in the DB (pagination, page 1 - implicitly set)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?perPage=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(true);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (pagination, page 1 - explicitly set)
  it('should find users in the DB (pagination, page 1 - explicitly set)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=1&perPage=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(true);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (pagination, page 2, perPage - implicitly set)
  it('should find users in the DB (pagination, page 2, perPage - implicitly set)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // find users in the DB (pagination, page 2, perPage - explicitly set)
  it('should find users in the DB (pagination, page 2, perPage - explicitly set)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=2&perPage=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(true);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i + 2);
    }
  });
  // find users in the DB (sorting)
  it('should find users in the DB (sorting)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, desc
    for (let i = 1; i <= 5; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(6 - i);
    }
  });
  // find courses in the DB (sorting on multiple fields, including aliased ones)
  it('should find courses in the DB (sorting on multiple fields, including aliased ones)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'orderBy[categoryId]=desc&orderBy[courseTypeId]=asc&orderBy[id]=desc',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // course 4 is the only one with a category (MySQL puts nulls last on desc), then courseTypeId asc, then id desc
    const expectedIds = [4, 2, 1, 3];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find courses in the DB (filters - simple, on an aliased field)
  it('should find courses in the DB (filters - simple, on an aliased field)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[categoryId]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    expect(responseBody.result.items[0].id).toEqual(4);
    expect(responseBody.result.items[0].categoryId).toEqual(1);
  });
  // find courses in the DB (filters - operator on an aliased field)
  it('should find courses in the DB (filters - operator on an aliased field)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[categoryId][$gte]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    expect(responseBody.result.items[0].id).toEqual(4);
  });
  // find courses in the DB (filters - aliased field inside a top-level $or operator)
  it('should find courses in the DB (filters - aliased field inside a top-level $or operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[$or][0][categoryId]=1&filters[$or][1][id]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    const expectedIds = [1, 4];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find users in the DB (filters - simple)
  it('should find users in the DB (filters - simple)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    // check the properties of the returned item
    expect(responseBody.result.items[0].id).toEqual(1);
  });
  // find users in the DB (filters - array of items)
  it('should find users in the DB (filters - array of items)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 4; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $like operator)
  it('should find users in the DB (filters - $like operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email][$like]=${encodeURIComponent('%node-c.com%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 5; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - array of items + $like operator)
  it('should find users in the DB (filters - array of items + $like operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&' +
        `filters[email][$like]=${encodeURIComponent('%node-c.com%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 4; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters: array of items with a $gt operator inside - demonstrates deeply nested filters capability)
  it('should find users in the DB (filters: array of items with a $gt operator inside - demonstrates deeply nested filters capability)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][0][$not]=24&filters[id][1][$gt]=0&filters[id][2][$lt]=5&' +
        `filters[email][0][$like]=${encodeURIComponent('%node-c.com%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 5; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - top-level $and operator on the same field)
  it('should find users in the DB (filters - top-level $and operator on the same field)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[$and][0][id][$gte]=2&filters[$and][1][id][$lte]=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(3);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(3);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 2; i <= 4; i++) {
      expect(responseBody.result.items[i - 2].id).toEqual(i);
    }
  });
  // find users in the DB (filters - top-level $and operator on different fields)
  it('should find users in the DB (filters - top-level $and operator on different fields)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[$and][0][accountStatusId]=1&filters[$and][1][hasTakenIntro]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    const expectedIds = [1, 2, 3, 5];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find users in the DB (filters - top-level $and operator on different fields, with a nested $like operator inside)
  it('should find users in the DB (filters - top-level $and operator on different fields, with a nested $like operator inside)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[$and][0][accountStatusId]=1&' +
        `filters[$and][1][email][$like]=${encodeURIComponent('%user%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(3);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(3);
    // check the properties of the returned items - should be ordered by id, asc
    const expectedIds = [2, 3, 5];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find users in the DB (filters - $or operator inside a field)
  it('should find users in the DB (filters - $or operator inside a field)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$or][]=1&filters[id][$or][]=2&filters[id][$or][]=3`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(3);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(3);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 3; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - top-level $or operator on different fields)
  it('should find users in the DB (filters - top-level $or operator on different fields)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[$or][0][id]=1&filters[$or][1][accountStatusId]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    const expectedIds = [1, 4];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find users in the DB (filters - field + top-level $or operator)
  it('should find users in the DB (filters - field + top-level $or operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[accountStatusId]=1&filters[$or][0][id]=1&filters[$or][1][id]=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    // user 4 matches the $or, but not accountStatusId=1 - the field and the $or must be combined with AND
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    expect(responseBody.result.items[0].id).toEqual(1);
  });
  // find users in the DB (filters - top-level $and operator + top-level $or operator)
  it('should find users in the DB (filters - top-level $and operator + top-level $or operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[$and][0][accountStatusId]=1&filters[$and][1][isVerified]=1&' +
        'filters[$or][0][id]=1&filters[$or][1][id][$gte]=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    // $and matches users 1, 2 and 5; $or matches users 1, 4 and 5
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    const expectedIds = [1, 5];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find users in the DB (filters - $ilike operator)
  it('should find users in the DB (filters - $ilike operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email][$ilike]=${encodeURIComponent('%USER0%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    expect(responseBody.result.items[0].id).toEqual(2);
  });
  // find users in the DB (filters - $not operator + $ilike operator)
  it('should find users in the DB (filters - $not operator + $ilike operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email][$not][$ilike]=${encodeURIComponent('%USER%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(1);
    expect(responseBody.result.items[0].id).toEqual(1);
  });
  // find users in the DB (filters - $not operator inside a field, as a single value)
  it('should find users in the DB (filters - $not operator inside a field, as a single value)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$not][]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 2; i <= 5; i++) {
      expect(responseBody.result.items[i - 2].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $not operator inside a field, as an array)
  it('should find users in the DB (filters - $not operator inside a field, as an array)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$not][]=1&filters[id][$not][]=2&filters[id][$not][]=3`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 4; i <= 5; i++) {
      expect(responseBody.result.items[i - 4].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $gt operator)
  it('should find users in the DB (filters - $gt operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gt]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 2; i <= 5; i++) {
      expect(responseBody.result.items[i - 2].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $gte operator)
  it('should find users in the DB (filters - $gte operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gte]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 2; i <= 5; i++) {
      expect(responseBody.result.items[i - 2].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $lt operator)
  it('should find users in the DB (filters - $lt operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$lt]=5`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 4; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $lte operator)
  it('should find users in the DB (filters - $lte operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$lte]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find users in the DB (filters - $between operator)
  it('should find users in the DB (filters - $between operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$between][]=2&filters[id][$between][]=4`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(3);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(3);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 2; i <= 4; i++) {
      expect(responseBody.result.items[i - 2].id).toEqual(i);
    }
  });
  // throw an error when finding users in the DB with a $between operator that doesn't have exactly 2 values
  it("should throw an error when finding users in the DB with a $between operator that doesn't have exactly 2 values", async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$between][]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid params count 1 for $between filter on field $between (alias: id).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when finding users in the DB with an operator other than $or or $between on a simple array
  it('should throw an error when finding users in the DB with an operator other than $or or $between on a simple array', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gt][]=1&filters[id][$gt][]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid operator $gt filter on field $gt (alias: id) - $in operator already active.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when finding users in the DB with nested filters under an operator other than $and, $or or $not
  it('should throw an error when finding users in the DB with nested filters under an operator other than $and, $or or $not', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gt][$lt]=5`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid nesting under operator $gt: only $and, $or and $not can contain nested filters.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when finding users in the DB with an operator directly inside a top-level $or operator
  it('should throw an error when finding users in the DB with an operator directly inside a top-level $or operator', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[$or][$like]=${encodeURIComponent('%node-c%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid nested operators: $or + $like'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when finding users in the DB with a $not operator nested under another $not operator
  it('should throw an error when finding users in the DB with a $not operator nested under another $not operator', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$not][$not]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid nesting of $not under $not.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when finding users in the DB with an operator that is not allowed under $not
  it('should throw an error when finding users in the DB with an operator that is not allowed under $not', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$not][$or][]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][user]: Invalid filter $or under $not: allowed values are $like, $ilike, $between, $gt, $gte, $lt, $lte and $contains.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find all users in the DB if findAll is set to true
  it('should find all users in the DB if findAll is set to true', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(5);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, desc
    for (let i = 5; i >= 1; i--) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find all users in the DB if findAll is set to true even if pagination params are set
  it('should find all users in the DB if findAll is set to true even if pagination params are set', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?findAll=true&page=2&perPage=30`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(5);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, desc
    for (let i = 5; i >= 1; i--) {
      expect(responseBody.result.items[i - 1].id).toEqual(i);
    }
  });
  // find courses in the DB (included relations)
  it('should find courses in the DB (included relations)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?include[]=courseType&include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(4);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(4);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 4; i++) {
      const item = responseBody.result.items[i - 1];
      expect(item.id).toEqual(i);
      expect(item).toHaveProperty('courseType');
      expect(item.courseType.id).toEqual(item.courseTypeId);
      expect(item).toHaveProperty('lessons');
      item.lessons.forEach(
        (lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
          expect(lesson).toHaveProperty('lessonType');
          expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
        }
      );
    }
  });
  // find courses (included relations with filters on relations - shallow, include added also)
  it('should find courses in the DB (included relations with filters on relations - shallow, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseType.id]=1&` +
        'include[]=courseType&include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      const item = responseBody.result.items[i - 1];
      expect(item.id).toEqual(i);
      expect(item.courseTypeId).toEqual(1);
      expect(item).toHaveProperty('courseType');
      expect(item.courseType.id).toEqual(item.courseTypeId);
      expect(item).toHaveProperty('lessons');
      item.lessons.forEach(
        (lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
          expect(lesson).toHaveProperty('lessonType');
          expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
        }
      );
    }
  });
  // not find courses due to inner join filters (included relations with filters on relations - shallow, include added also)
  it('should not find courses due to inner join filters in the DB (included relations with filters on relations - shallow, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseType.id]=175&` +
        'include[]=courseType&include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(0);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // throw a forbidden relation error on an attempt to find lessons (included relations with filters on relations - shallow, include not added)
  it('should throw a forbidden relation error on an attempt to find courses in the DB (included relations with filters on relations - shallow, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseType.id]=1&include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.courseType (course__courseType).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find courses in the DB (included relations with filters on relations - deep, include added also)
  it('should find courses in the DB (included relations with filters on relations - deep, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[lessons.lessonType.id]=1&` +
        'include[]=courseType&include[]=lessons&include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should be ordered by id, asc
    for (let i = 1; i <= 2; i++) {
      const item = responseBody.result.items[i - 1];
      expect(item.id).toEqual(i);
      expect(item).toHaveProperty('courseType');
      expect(item.courseType.id).toEqual(item.courseTypeId);
      expect(item).toHaveProperty('lessons');
      item.lessons.forEach(
        (lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
          expect(lesson.lessonTypeId).toEqual(1);
          expect(lesson).toHaveProperty('lessonType');
          expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
        }
      );
    }
  });
  // not find courses in the DB due to inner join filters (included relations with filters on relations - deep, include added also)
  it('should not find courses in the DB due to inner join filters (included relations with filters on relations - deep, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[lessons.lessonType.id]=1758&` +
        'include[]=courseType&include[]=lessons&include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(0);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // throw a forbidden relation error on an attempt to find courses in the DB (included relations with filters on relations - deep, include not added at lvl 1)
  it('should throw a forbidden relation error on an attempt to find courses in the DB (included relations with filters on relations - deep, include not added at lvl 1)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[lessons.lessonType.id]=1&` +
        'include[]=courseType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons (course__lessons).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden relation error on an attempt to find courses in the DB (included relations with filters on relations - deep, include not added at lvl 2)
  it('should throw a forbidden relation error on an attempt to find courses in the DB (included relations with filters on relations - deep, include not added at lvl 2)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[lessons.lessonType.id]=1&` +
        'include[]=courseType&include[]=lessons',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course__lessons.lessonType (course__lessons__lessonType).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find courses in the DB - select specific fields only, including aliased fields
  it('should find courses in the DB - select specific fields only, including aliased fields', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[id]=4&' +
        'select[]=id&select[]=name&select[]=categoryId',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    const [item] = responseBody.result.items;
    expect(item.id).toEqual(4);
    expect(item.name).toEqual('Cooking: A Day In Hell With Gordon Ramsey');
    expect(item.categoryId).toEqual(1);
    // non-selected fields must not be returned
    expect(item).not.toHaveProperty('courseTypeId');
    expect(item).not.toHaveProperty('createdAt');
  });
  // throw an error when trying to find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search
  it('should throw an error when trying to find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[id][$gte]=1&' +
        'filters[id][$lte]=5&' +
        'include[]=lessons&include[]=lessons.lessonType&' +
        'orderBy[id]=desc&' +
        'select[]=id&select[]=courseType.id&select[]=lessons.id',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.courseType.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden relation error on an attempt to find courses in the DB (select on a relation field - deep, include not added at lvl 2)
  it('should throw a forbidden relation error on an attempt to find courses in the DB (select on a relation field - deep, include not added at lvl 2)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'include[]=lessons&' +
        'select[]=id&select[]=lessons.id&select[]=lessons.lessonType.id',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course__lessons.lessonType.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden relation error on an attempt to find courses in the DB (ordered by a field of a relation, include not added)
  it('should throw a forbidden relation error on an attempt to find courses in the DB (ordered by a field of a relation, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?orderBy[lessons.id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons (course__lessons).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search
  it('should find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[courseType.id]=1&' +
        'filters[id][$gte]=1&' +
        'filters[id][$lte]=5&' +
        'include[]=courseType&include[]=lessons&include[]=lessons.lessonType&include[]=courseType&' +
        'orderBy[id]=desc&' +
        'select[]=id&select[]=courseType.id&select[]=lessons.id',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    expect(responseBody.result.items[0].id).toEqual(2);
    expect(responseBody.result.items[0]).not.toHaveProperty('name');
    expect(responseBody.result.items[0]).toHaveProperty('courseType');
    expect(responseBody.result.items[0].courseType.id).toEqual(1);
    expect(responseBody.result.items[0]).toHaveProperty('lessons');
    expect(responseBody.result.items[0].lessons).toHaveLength(2);
    expect(responseBody.result.items[0].lessons[0].id).toEqual(5);
    expect(responseBody.result.items[0].lessons[1].id).toEqual(6);
    expect(responseBody.result.items[1].id).toEqual(1);
    expect(responseBody.result.items[1]).not.toHaveProperty('name');
    expect(responseBody.result.items[1]).toHaveProperty('courseType');
    expect(responseBody.result.items[1].courseType.id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('lessons');
    expect(responseBody.result.items[1].lessons).toHaveLength(4);
    expect(responseBody.result.items[1].lessons[0].id).toEqual(1);
    expect(responseBody.result.items[1].lessons[1].id).toEqual(2);
    expect(responseBody.result.items[1].lessons[2].id).toEqual(3);
    expect(responseBody.result.items[1].lessons[3].id).toEqual(4);
  });
  // find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search
  it('should find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[courseType.id]=1&' +
        'filters[id][$gte]=1&' +
        'filters[id][$lte]=5&' +
        'include[]=courseType&include[]=lessons&include[]=lessons.lessonType&include[]=courseType&' +
        'orderBy[id]=desc&' +
        'select[]=id&select[]=courseType.id&select[]=lessons.id',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    expect(responseBody.result.items[0].id).toEqual(2);
    expect(responseBody.result.items[0]).not.toHaveProperty('name');
    expect(responseBody.result.items[0]).toHaveProperty('courseType');
    expect(responseBody.result.items[0].courseType.id).toEqual(1);
    expect(responseBody.result.items[0]).toHaveProperty('lessons');
    expect(responseBody.result.items[0].lessons).toHaveLength(2);
    expect(responseBody.result.items[0].lessons[0].id).toEqual(5);
    expect(responseBody.result.items[0].lessons[1].id).toEqual(6);
    expect(responseBody.result.items[1].id).toEqual(1);
    expect(responseBody.result.items[1]).not.toHaveProperty('name');
    expect(responseBody.result.items[1]).toHaveProperty('courseType');
    expect(responseBody.result.items[1].courseType.id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('lessons');
    expect(responseBody.result.items[1].lessons).toHaveLength(4);
    expect(responseBody.result.items[1].lessons[0].id).toEqual(1);
    expect(responseBody.result.items[1].lessons[1].id).toEqual(2);
    expect(responseBody.result.items[1].lessons[2].id).toEqual(3);
    expect(responseBody.result.items[1].lessons[3].id).toEqual(4);
  });
  // find courses in the DB - full range of options (filters, included relations, ordering) with findAll, NO multi-data-service search
  it('should find courses in the DB - full range of options (filters, included relations, ordering) with findAll, NO multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[courseType.id]=1&' +
        'filters[id][$gte]=1&' +
        'filters[id][$lte]=5&' +
        'findAll=true&' +
        'include[]=courseType&include[]=lessons&include[]=lessons.lessonType&' +
        'orderBy[id]=desc',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    // findAll returns everything on 1 page, without a total count
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toBeUndefined();
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    expect(responseBody.result.items[0].id).toEqual(2);
    expect(responseBody.result.items[0]).toHaveProperty('courseType');
    expect(responseBody.result.items[0].courseType.id).toEqual(1);
    expect(responseBody.result.items[0]).toHaveProperty('lessons');
    expect(responseBody.result.items[0].lessons).toHaveLength(2);
    expect(responseBody.result.items[1].id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('courseType');
    expect(responseBody.result.items[1].courseType.id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('lessons');
    expect(responseBody.result.items[1].lessons).toHaveLength(4);
  });
  // throw an error when searching for courses in the cache if findAll=true and individualSearch is set to true explicitly
  it('should throw an error when searching for courses in the cache if findAll=true and individualSearch is set to true explicitly', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&' +
        'findAll=true&' +
        'individualSearch=true',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    // we expect multiple new items to be created
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Error]: Primary key filters are required when findAll and individualSearchEnabled are enabled in the find method.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  });
  // TODO: all of the above tests except relations, but with the cache
  // log in as admin again, so that there are at least 2 login logs with different datetimes for the login logs cases
  it('should log the admin user in successfully again', async () => {
    // the datetime column has a precision of seconds, so this makes sure the new login log has a later datetime
    await new Promise((resolve) => {
      setTimeout(resolve, 1100);
    });
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: {
          password: 'AdminPassword'
        },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    adminAccessToken = responseBody.accessToken;
  });
  // find all login logs of the admin user (findAll, sorting) - the results are used as a benchmark in the next cases
  it('should find all login logs of the admin user (findAll, sorting)', async () => {
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email]=${encodeURIComponent('admin@node-c.com')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    adminUserId = adminResponseBody.result.items[0].id;
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    const items: TestUserLoginLog[] = responseBody.result.items;
    // 1 login from the start of the suite + 1 from the previous case
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(responseBody.result.perPage).toEqual(items.length);
    for (const i in items) {
      const item = items[i];
      expect(Number(item.userId)).toEqual(adminUserId);
      // the datetime column has a precision of seconds, so multiple logins can share the same datetime
      if (Number(i) > 0) {
        expect(item.datetime >= items[Number(i) - 1].datetime).toEqual(true);
      }
    }
    adminLoginLogs = items;
  });
  // find login logs of the admin user (no options)
  it('should find login logs of the admin user (no options)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(adminLoginLogs.length > 10);
    expect(responseBody.result.totalCount).toEqual(adminLoginLogs.length);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(
      Math.min(adminLoginLogs.length, 10)
    );
    const items: TestUserLoginLog[] = responseBody.result.items;
    for (const i in items) {
      expect(Number(items[i].userId)).toEqual(adminUserId);
    }
  });
  // find login logs of the admin user (pagination, page 1)
  it('should find login logs of the admin user (pagination, page 1)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?orderBy[datetime]=asc&page=1&perPage=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(1);
    expect(responseBody.result.more).toEqual(adminLoginLogs.length > 1);
    expect(responseBody.result.totalCount).toEqual(adminLoginLogs.length);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toEqual(adminLoginLogs.slice(0, 1));
  });
  // find login logs of the admin user (pagination, page 2)
  it('should find login logs of the admin user (pagination, page 2)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?orderBy[datetime]=asc&page=2&perPage=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(1);
    expect(responseBody.result.more).toEqual(adminLoginLogs.length > 2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toEqual(adminLoginLogs.slice(1, 2));
  });
  // find all login logs of the admin user if findAll is set to true even if pagination params are set
  it('should find all login logs of the admin user if findAll is set to true even if pagination params are set', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&page=2&perPage=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.perPage).toEqual(adminLoginLogs.length);
    expect(responseBody.result.items).toEqual(adminLoginLogs);
  });
  // find login logs of the admin user (sorting, desc)
  it('should find login logs of the admin user (sorting, desc)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    const expectedItems: TestUserLoginLog[] = [];
    for (let i = adminLoginLogs.length - 1; i >= 0; i--) {
      expectedItems.push(adminLoginLogs[i]);
    }
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - simple)
  it('should find login logs of the admin user (filters - simple)', async () => {
    const { datetime } = adminLoginLogs[adminLoginLogs.length - 1];
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime === datetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&` +
        `filters[datetime]=${encodeURIComponent(datetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - array of items)
  it('should find login logs of the admin user (filters - array of items)', async () => {
    const firstDatetime = adminLoginLogs[0].datetime;
    const lastDatetime = adminLoginLogs[adminLoginLogs.length - 1].datetime;
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime === firstDatetime || item.datetime === lastDatetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[datetime][]=${encodeURIComponent(firstDatetime)}&` +
        `filters[datetime][]=${encodeURIComponent(lastDatetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - $gt and $lte operators)
  it('should find login logs of the admin user (filters - $gt and $lte operators)', async () => {
    const firstDatetime = adminLoginLogs[0].datetime;
    const lastDatetime = adminLoginLogs[adminLoginLogs.length - 1].datetime;
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime > firstDatetime && item.datetime <= lastDatetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[datetime][$gt]=${encodeURIComponent(firstDatetime)}&` +
        `filters[datetime][$lte]=${encodeURIComponent(lastDatetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - $gte and $lt operators)
  it('should find login logs of the admin user (filters - $gte and $lt operators)', async () => {
    const firstDatetime = adminLoginLogs[0].datetime;
    const lastDatetime = adminLoginLogs[adminLoginLogs.length - 1].datetime;
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime >= firstDatetime && item.datetime < lastDatetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[datetime][$gte]=${encodeURIComponent(firstDatetime)}&` +
        `filters[datetime][$lt]=${encodeURIComponent(lastDatetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - $between operator)
  it('should find login logs of the admin user (filters - $between operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[datetime][$between][]=${encodeURIComponent(adminLoginLogs[0].datetime)}&` +
        `filters[datetime][$between][]=${encodeURIComponent(adminLoginLogs[adminLoginLogs.length - 1].datetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    // the range is inclusive and covers all of the items
    expect(responseBody.result.items).toEqual(adminLoginLogs);
  });
  // find login logs of the admin user (filters - $not operator inside a field, as a single value)
  it('should find login logs of the admin user (filters - $not operator inside a field, as a single value)', async () => {
    const excludedDatetime = adminLoginLogs[0].datetime;
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime !== excludedDatetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[datetime][$not]=${encodeURIComponent(excludedDatetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // find login logs of the admin user (filters - top-level $or operator)
  it('should find login logs of the admin user (filters - top-level $or operator)', async () => {
    const firstDatetime = adminLoginLogs[0].datetime;
    const lastDatetime = adminLoginLogs[adminLoginLogs.length - 1].datetime;
    const expectedItems: TestUserLoginLog[] = [];
    for (const i in adminLoginLogs) {
      const item = adminLoginLogs[i];
      if (item.datetime === firstDatetime || item.datetime >= lastDatetime) {
        expectedItems.push(item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[$or][0][datetime]=${encodeURIComponent(firstDatetime)}&` +
        `filters[$or][1][datetime][$gte]=${encodeURIComponent(lastDatetime)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    // the userId filter added by the controller must still apply to all items, despite the top-level $or
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // return no login logs of the admin user if none match the provided filters
  it('should return no login logs of the admin user if none match the provided filters', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?` +
        `filters[datetime][$lt]=${encodeURIComponent('2000-01-01 00:00:00')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(0);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // find login logs of the admin user (sorting on multiple fields)
  it('should find login logs of the admin user (sorting on multiple fields)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=desc&orderBy[userId]=asc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    // all items have the same userId, so the datetime ordering decides the order
    const expectedItems: TestUserLoginLog[] = [];
    for (let i = adminLoginLogs.length - 1; i >= 0; i--) {
      expectedItems.push(adminLoginLogs[i]);
    }
    expect(responseBody.result.items).toEqual(expectedItems);
  });
  // throw an error when trying to find login logs of the admin user with specific fields selected (not implemented for ClickHouse)
  it('should throw an error when trying to find login logs of the admin user with specific fields selected (not implemented for ClickHouse)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?select[]=datetime`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.select not implemented.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when trying to find login logs of the admin user with included relations (not implemented for ClickHouse)
  it('should throw an error when trying to find login logs of the admin user with included relations (not implemented for ClickHouse)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?include[]=user`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.leftJoinAndSelect not implemented.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find login logs of the admin user (filters - array of more than 10 items, so that parameter names like _1 and _10 coexist)
  it('should find login logs of the admin user (filters - array of more than 10 items, so that parameter names like _1 and _10 coexist)', async () => {
    const datetimes: string[] = [];
    const datetimesMap: Record<string, boolean> = {};
    for (const i in adminLoginLogs) {
      const { datetime } = adminLoginLogs[i];
      if (!datetimesMap[datetime]) {
        datetimesMap[datetime] = true;
        datetimes.push(datetime);
      }
    }
    // pad the list with datetimes that don't match anything, up to 11 items
    for (let i = 0; datetimes.length < 11; i++) {
      datetimes.push(`2000-01-01 00:00:${i < 10 ? `0${i}` : i}`);
    }
    let datetimesQuery = '';
    for (const i in datetimes) {
      datetimesQuery += `&filters[datetime][]=${encodeURIComponent(datetimes[i])}`;
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc${datetimesQuery}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(adminLoginLogs);
  });
  // throw an error when trying to find login logs of the admin user with an SQL injection attempt in a filter value
  it('should throw an error when trying to find login logs of the admin user with an SQL injection attempt in a filter value', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&` +
        `filters[datetime]=${encodeURIComponent("2000-01-01'or'1'='1")}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    // the value is sent as a query param, so ClickHouse treats the whole of it as a string and fails to parse it as a datetime,
    // instead of executing the injected condition and returning the stored login logs
    expect(response.status).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(responseBody).not.toHaveProperty('result');
    expect(responseBody).toHaveProperty('error');
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
  });
  // throw an error when trying to find login logs of the admin user with an SQL injection attempt in a filter field name
  it('should throw an error when trying to find login logs of the admin user with an SQL injection attempt in a filter field name', async () => {
    const fieldName = 'datetime`=`datetime`or`1';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?` +
        `filters[${encodeURIComponent(fieldName)}]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    // the parameter name is built from the field name, so the injected characters make it invalid
    expect(responseBody.error).toEqual(
      `Method ClickHouseSelectQueryBuilder.where received an invalid parameter name: userLoginLog___${fieldName}_0.`
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when trying to find login logs of the admin user with an SQL injection attempt in a sorting field
  it('should throw an error when trying to find login logs of the admin user with an SQL injection attempt in a sorting field', async () => {
    const fieldName = 'datetime,(select(1))';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?` +
        `orderBy[${encodeURIComponent(fieldName)}]=asc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      `Method ClickHouseSelectQueryBuilder.orderBy received an invalid field: userLoginLog.${fieldName}.`
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when trying to find login logs of the admin user with a negative page value (invalid skip count)
  it('should throw an error when trying to find login logs of the admin user with a negative page value (invalid skip count)', async () => {
    // non-numeric values are dropped by the find DTO, so a negative page is used to get a negative skip count - (-1 - 1) * 10
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?page=-1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.skip expects a non-negative integer input for skipCount.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw an error when trying to find login logs of the admin user with a negative perPage value (invalid take count)
  it('should throw an error when trying to find login logs of the admin user with a negative perPage value (invalid take count)', async () => {
    // on page 1 the skip count is 0, so only the take count (perPage + 1) is invalid
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?page=1&perPage=-5`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.take expects a non-negative integer input for takeCount.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // ----
  // -- end of admin cases - login and single-service find
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - create and multi-service find
  // ----
  // throw an error when attempting to create a course without a required field
  it('should throw an error when attempting to create a course without a required field', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: 1
          }
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      "[RBDEntityService][ER_NO_DEFAULT_FOR_FIELD]: Field 'name' doesn't have a default value."
    );
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length
    );
  });
  // throw an error when attempting to create a course with a relation field for a relation value that does not exist
  it('should throw an error when attempting to create a course with a relation field for a relation value that does not exist', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: 25,
            name: 'This will fail'
          }
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RBDEntityService][ER_NO_REFERENCED_ROW_2]: Cannot add or update a child row: a foreign key constraint fails (`node_c_apps_test_main_e2e`.`courses`, CONSTRAINT `FK_7d0effe56712c9f8d73b99f319c` FOREIGN KEY (`courseTypeId`) REFERENCES `courseTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION).'
    );
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length
    );
  });
  // create a course in the DB
  it('should create a course in the DB', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: 1,
            name: 'Test create course'
          }
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(HttpStatus.CREATED);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(
      dataPreCreateBody.result.items[0].id + 2
    );
    expect(responseBody.result.courseTypeId).toEqual(1);
    expect(responseBody.result.name).toEqual('Test create course');
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length + 1
    );
  });
  // throw an error when attempting to create a course with a duplicate unique field
  it('should throw an error when attempting to create a course with a duplicate unique field', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: 1,
            name: 'Test create course'
          }
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      "[RBDEntityService][ER_DUP_ENTRY]: Duplicate entry '1-Test create course' for key 'COURSES_UNIQUE_IDX_0'."
    );
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length
    );
  });
  // fail to create a course in the cache directly because a non-generated PK has not been provided
  it('should fail to create a course in the cache directly because a non-generated PK has not been provided', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: 2,
            name: 'Test create course 2'
          },
          dataServices: ['cache']
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Validation Error]: A value is required for generated PK column id when the generatePrimaryKeys is set to false or isArray is set to true.'
    );
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(0);
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length
    );
  });
  // TODO: tests for redis validations
  // create a course in the cache directly
  it('should create a course in the cache directly if all data has been provided correctly', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            id: 4,
            categoryId: 1,
            courseTypeId: 3,
            name: 'Cooking: A Day In Hell With Gordon Ramsey'
          },
          dataServices: ['cache']
        }),
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(HttpStatus.CREATED);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(4);
    expect(responseBody.result.courseTypeId).toEqual(3);
    expect(responseBody.result.name).toEqual(
      'Cooking: A Day In Hell With Gordon Ramsey'
    );
    const dataPostCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateBody = await dataPostCreate.json();
    expect(dataPostCreateBody.result.items.length).toEqual(
      dataPreCreateBody.result.items.length + 1
    );
  });
  // search for courses in the cache and create using db data because its not in the cache (runOnFirstServiceResultOnly=true, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=true)
  it('should search for courses in the cache and create using db data because its not in the cache (runOnFirstServiceResultOnly=true, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=true)', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'filters[id][]=1&filters[id][]=2&' +
        'individualSearch=false&' +
        'optionsOverridesByService[main][runOnNoFirstServiceResultOnly]=true&' +
        'saveAdditionalResultsInFirstService[serviceName]=main&' +
        'saveAdditionalResultsInFirstService[useResultsForFirstServiceReturnData]=true',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    expect(responseBody.result.items[0].id).toEqual(1);
    expect(responseBody.result.items[1].id).toEqual(2);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(2);
    expect(responseBody.resultsByService.main.items[0].id).toEqual(1);
    expect(responseBody.resultsByService.main.items[1].id).toEqual(2);
    // we expect only 2 new items to be created; we do the search with a 2nd request here on purpose,
    // because the previous request is explicitly filtered by id=[1,2], whereas this one has findAll=true;
    // this way, we also kinda test findAll on the redis service :)
    const responseCheck = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?dataServices[]=cache&findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseCheckBody = await responseCheck.json();
    expect(responseCheckBody.result.items).toHaveLength(
      dataPreCreateBody.result.items.length + 2
    );
    const idsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      4: false
    };
    responseCheckBody.result.items.forEach((item: { id: number }) => {
      if (idsToFind[item.id] === false) {
        idsToFind[item.id] = true;
      }
    });
    for (const id in idsToFind) {
      expect(idsToFind[id]).toEqual(true);
    }
  });
  // search for courses in the cache and their counterparts in the DB (runOnFirstServiceResultOnly=false, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=false, filterByFirstServiceResultFields set to id)
  it('should search for courses in the cache and their counterparts in the DB (runOnFirstServiceResultOnly=false, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=false, filterByFirstServiceResultFields set to id)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'findAll=true&' +
        'individualSearch=false&' +
        'optionsOverridesByService[main][filterByFirstServiceResultFields][id]=id&' +
        'optionsOverridesByService[main][orderBy][id]=desc&' +
        'optionsOverridesByService[main][runOnNoFirstServiceResultOnly]=false&' +
        'saveAdditionalResultsInFirstService[serviceName]=main&' +
        'saveAdditionalResultsInFirstService[useResultsForFirstServiceReturnData]=false',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    // we expect multiple new items to be created
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(3);
    const resultIdsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      4: false
    };
    responseBody.result.items.forEach((item: { id: number }) => {
      if (resultIdsToFind[item.id] === false) {
        resultIdsToFind[item.id] = true;
      }
    });
    for (const id in resultIdsToFind) {
      expect(resultIdsToFind[id]).toEqual(true);
    }
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(3);
    expect(responseBody.resultsByService.main.items[0].id).toEqual(4);
    expect(responseBody.resultsByService.main.items[1].id).toEqual(2);
    expect(responseBody.resultsByService.main.items[2].id).toEqual(1);
    const responseCheck = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?dataServices[]=cache&findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseCheckBody = await responseCheck.json();
    expect(responseCheckBody.result.items).toHaveLength(3);
    const idsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      4: false
    };
    responseCheckBody.result.items.forEach((item: { id: number }) => {
      if (idsToFind[item.id] === false) {
        idsToFind[item.id] = true;
      }
    });
    for (const id in idsToFind) {
      expect(idsToFind[id]).toEqual(true);
    }
  });
  // search for courses in the cache and create using the db data all of the entries found in the DB (runOnFirstServiceResultOnly=false, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=false, filterByFirstServiceResultFields not set)
  it('should search for courses in the cache and create using the db data all of the entries found in the DB (runOnFirstServiceResultOnly=false, saveAdditionalResultsInFirstService enabled with useResultsForFirstServiceReturnData=false, filterByFirstServiceResultFields not set)', async () => {
    const dataPreCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateBody = await dataPreCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'findAll=true&' +
        'individualSearch=false&' +
        'optionsOverridesByService[main][orderBy][id]=desc&' +
        'optionsOverridesByService[main][runOnNoFirstServiceResultOnly]=false&' +
        'saveAdditionalResultsInFirstService[serviceName]=main&' +
        'saveAdditionalResultsInFirstService[useResultsForFirstServiceReturnData]=false',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    // we expect multiple new items to be created
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(5);
    const resultIdsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      3: false,
      4: false,
      6: false
    };
    responseBody.result.items.forEach((item: { id: number }) => {
      if (resultIdsToFind[item.id] === false) {
        resultIdsToFind[item.id] = true;
      }
    });
    for (const id in resultIdsToFind) {
      expect(resultIdsToFind[id]).toEqual(true);
    }
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(5);
    expect(responseBody.resultsByService.main.items[0].id).toEqual(6);
    expect(responseBody.resultsByService.main.items[1].id).toEqual(4);
    expect(responseBody.resultsByService.main.items[2].id).toEqual(3);
    expect(responseBody.resultsByService.main.items[3].id).toEqual(2);
    expect(responseBody.resultsByService.main.items[4].id).toEqual(1);
    const responseCheck = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?dataServices[]=cache&findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseCheckBody = await responseCheck.json();
    expect(responseCheckBody.result.items).toHaveLength(
      dataPreCreateBody.result.items.length + 2
    );
    const idsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      3: false,
      4: false,
      6: false
    };
    responseCheckBody.result.items.forEach((item: { id: number }) => {
      if (idsToFind[item.id] === false) {
        idsToFind[item.id] = true;
      }
    });
    for (const id in idsToFind) {
      expect(idsToFind[id]).toEqual(true);
    }
  });
  // find courses in the cache with pagination and filters (page 1)
  it('should find courses in the cache with pagination and filters (page 1)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&' +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&' +
        'individualSearch=true&' +
        'page=1&perPage=2',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(true);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should follow the order of the id filter
    const expectedIds = [1, 2];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find courses in the cache with pagination and filters (page 2)
  it('should find courses in the cache with pagination and filters (page 2)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&' +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&' +
        'individualSearch=true&' +
        'page=2&perPage=2',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(2);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(2);
    // check the properties of the returned items - should follow the order of the id filter
    const expectedIds = [3, 4];
    for (const i in expectedIds) {
      expect(responseBody.result.items[i].id).toEqual(expectedIds[i]);
    }
  });
  // find courses in the cache with filters - primary key + non-primary-key field
  it('should find courses in the cache with filters - primary key + non-primary-key field', async () => {
    const idsQuery =
      'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&';
    const dataPreSearch = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&' +
        idsQuery +
        'individualSearch=true&' +
        'page=1&perPage=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreSearchBody = await dataPreSearch.json();
    const preItems: TestCourse[] = dataPreSearchBody.result.items;
    expect(preItems).toHaveLength(4);
    const { courseTypeId } = preItems[0];
    const expectedIds: number[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (item.courseTypeId === courseTypeId) {
        expectedIds.push(item.id);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&' +
        idsQuery +
        `filters[courseTypeId]=${courseTypeId}&` +
        'individualSearch=true&' +
        'page=1&perPage=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(4);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(expectedIds.length);
    // check the properties of the returned items - should follow the order of the id filter
    for (const i in expectedIds) {
      const item = responseBody.result.items[i];
      expect(item.id).toEqual(expectedIds[i]);
      expect(item.courseTypeId).toEqual(courseTypeId);
    }
  });
  // find courses in the cache and the DB, with additional filters for the DB in optionsOverridesByService
  it('should find courses in the cache and the DB, with additional filters for the DB in optionsOverridesByService', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&' +
        'findAll=true&' +
        'individualSearch=false&' +
        'optionsOverridesByService[main][filters][courseTypeId]=1&' +
        'optionsOverridesByService[main][orderBy][id]=desc&' +
        'optionsOverridesByService[main][runOnNoFirstServiceResultOnly]=false',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // the cache only gets the base filters
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    const cacheItems: TestCourse[] = responseBody.result.items;
    expect(cacheItems).toHaveLength(4);
    const expectedCacheIds = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, true],
      [4, true]
    ]);
    for (const i in cacheItems) {
      expect(expectedCacheIds.has(cacheItems[i].id)).toEqual(true);
    }
    // the DB gets the base filters AND the override filters
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(2);
    const expectedMainIds = [2, 1];
    for (const i in expectedMainIds) {
      expect(responseBody.resultsByService.main.items[i].id).toEqual(
        expectedMainIds[i]
      );
    }
  });
  // find courses in the cache and the DB, with an additional top-level $or filter for the DB in optionsOverridesByService
  it('should find courses in the cache and the DB, with an additional top-level $or filter for the DB in optionsOverridesByService', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4&' +
        'findAll=true&' +
        'individualSearch=false&' +
        'optionsOverridesByService[main][filters][$or][0][courseTypeId]=2&' +
        'optionsOverridesByService[main][filters][$or][1][id]=1&' +
        'optionsOverridesByService[main][orderBy][id]=desc&' +
        'optionsOverridesByService[main][runOnNoFirstServiceResultOnly]=false',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // the cache only gets the base filters
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    const cacheItems: TestCourse[] = responseBody.result.items;
    expect(cacheItems).toHaveLength(4);
    const expectedCacheIds = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, true],
      [4, true]
    ]);
    for (const i in cacheItems) {
      expect(expectedCacheIds.has(cacheItems[i].id)).toEqual(true);
    }
    // the DB gets id in (1, 2, 3, 4) AND (courseTypeId = 2 OR id = 1)
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(2);
    const expectedMainIds = [3, 1];
    for (const i in expectedMainIds) {
      expect(responseBody.resultsByService.main.items[i].id).toEqual(
        expectedMainIds[i]
      );
    }
  });
  // ----
  // -- end of admin cases - create and multi-service find
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - single-service findOne
  // ----
  // throw a 404 error if the id is missing from the params
  it('should throw a 404 error if the id is missing from the params', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users/item`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
  });
  // not find a course in the DB by id if it doesn't exist
  it("should not find a course in the DB by id if it doesn't exist", async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/100`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB by id (no filters)
  it('should find a course in the DB by id (no filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // find a course in the DB (filters - simple filter)
  it('should find a course in the DB (filters - simple filter)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        'filters[courseTypeId]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result.courseTypeId).toEqual(1);
  });
  // find a course in the DB (filters - array of items with a match)
  it('should find a course in the DB (filters - array of items with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'filters[courseTypeId][]=1&filters[courseTypeId][]=2',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(1);
  });
  // not find a course in the DB (filters - array of items with no match)
  it('should not find a course in the DB (filters - array of items with no match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'filters[courseTypeId][]=2&filters[courseTypeId][]=3',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual(null);
  });
  // find a course in the DB (filters - $like operator with a match)
  it('should find a course in the DB (filters - $like operator with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        `filters[name][$like]=${encodeURIComponent('%Cooking%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // not find a course in the DB (filters - $like operator without a match)
  it('should not find a course in the DB (filters - $like operator without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        `filters[name][$like]=${encodeURIComponent('%booking%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (filters - array of items + $like operator with a match)
  it('should find a course in the DB (filters - array of items + $like operator with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/3?` +
        'filters[courseTypeId][]=1&filters[courseTypeId][]=2&' +
        `filters[name][$like]=${encodeURIComponent('%Cooking%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(3);
  });
  // not find a course in the DB (filters - array of items + $like operator without a match)
  it('should not find a course in the DB (filters - array of items + $like operator without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/3?` +
        'filters[courseTypeId][]=1&filters[courseTypeId][]=2&' +
        `filters[name][$like]=${encodeURIComponent('%booking%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (included relations, ordered by a field of the included relation)
  it('should find a course in the DB (included relations, ordered by a field of the included relation)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'include[]=lessons&orderBy[lessons.id]=desc',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(1);
    expect(responseBody.result).toHaveProperty('lessons');
    expect(responseBody.result.lessons).toHaveLength(4);
    const expectedLessonIds = [4, 3, 2, 1];
    for (const i in expectedLessonIds) {
      expect(responseBody.result.lessons[i].id).toEqual(expectedLessonIds[i]);
    }
  });
  // throw a forbidden relation error when trying to find a course in the DB (select on a relation field, include not added)
  it('should throw a forbidden relation error when trying to find a course in the DB (select on a relation field, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'select[]=id&select[]=lessons.id',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden relation error when trying to find a course in the DB (ordered by a field of a relation, include not added)
  it('should throw a forbidden relation error when trying to find a course in the DB (ordered by a field of a relation, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?orderBy[lessons.id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons (course__lessons).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find a course in the DB (filters - top-level $and operator on the same field, with a match)
  it('should find a course in the DB (filters - top-level $and operator on the same field, with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        'filters[$and][0][courseTypeId][$gte]=1&filters[$and][1][courseTypeId][$lte]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // not find a course in the DB (filters - top-level $and operator on the same field, without a match)
  it('should not find a course in the DB (filters - top-level $and operator on the same field, without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/3?` +
        'filters[$and][0][courseTypeId][$gte]=1&filters[$and][1][courseTypeId][$lte]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (filters - top-level $and operator on different fields, with a match)
  it('should find a course in the DB (filters - top-level $and operator on different fields, with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        'filters[$and][0][courseTypeId]=1&' +
        `filters[$and][1][name][$like]=${encodeURIComponent('%Intermediate%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // not find a course in the DB (filters - top-level $and operator on different fields, without a match)
  it('should not find a course in the DB (filters - top-level $and operator on different fields, without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'filters[$and][0][courseTypeId]=1&' +
        `filters[$and][1][name][$like]=${encodeURIComponent('%Intermediate%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (filters - top-level $or operator on the same field, with a match)
  it('should find a course in the DB (filters - top-level $or operator on the same field, with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/3?` +
        'filters[$or][0][courseTypeId]=2&filters[$or][1][courseTypeId]=3',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(3);
  });
  // not find a course in the DB (filters - top-level $or operator on the same field, without a match)
  it('should not find a course in the DB (filters - top-level $or operator on the same field, without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        'filters[$or][0][courseTypeId]=2&filters[$or][1][courseTypeId]=3',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (filters - top-level $or operator on different fields, with a match)
  it('should find a course in the DB (filters - top-level $or operator on different fields, with a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        'filters[$or][0][courseTypeId]=2&' +
        `filters[$or][1][name][$like]=${encodeURIComponent('%Intermediate%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // not find a course in the DB (filters - top-level $or operator on different fields, without a match)
  it('should not find a course in the DB (filters - top-level $or operator on different fields, without a match)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1?` +
        'filters[$or][0][courseTypeId]=2&' +
        `filters[$or][1][name][$like]=${encodeURIComponent('%Intermediate%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the DB (included relations)
  it('should find a course in the DB (included relations)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?include[]=lessons`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result).toHaveProperty('lessons');
    expect(responseBody.result.lessons).toHaveLength(2);
    expect(responseBody.result.lessons[0].id).toEqual(5);
    expect(responseBody.result.lessons[1].id).toEqual(6);
  });
  // find a course (included relations with filters on relations - shallow, include added also)
  it('should find a course (included relations with filters on relations - shallow, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?filters[lessons.id]=5&include[]=lessons`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result).toHaveProperty('lessons');
    expect(responseBody.result.lessons).toHaveLength(1);
    expect(responseBody.result.lessons[0].id).toEqual(5);
  });
  // not find a course due to filters on inner join (included relations with filters on relations - ягьввду, include added also)
  it('should not find a course due to filters on inner join (included relations with filters on relations - ягьввду, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        `filters[lessons.name][$like]=${encodeURIComponent('%Boogie%')}&` +
        'include[]=lessons',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - shallow, include not added)
  it('should throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - shallow, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?filters[lessons.id]=5`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons (course__lessons).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // find a course (included relations with filters on relations - deep, include added also)
  it('should find a course (included relations with filters on relations - deep, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        `filters[lessons.lessonType.name][$like]=${encodeURIComponent('%stan%')}&` +
        'include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result).toHaveProperty('lessons');
    expect(responseBody.result.lessons).toHaveLength(1);
    expect(responseBody.result.lessons[0].id).toEqual(6);
    expect(responseBody.result.lessons[0]).toHaveProperty('lessonType');
    expect(responseBody.result.lessons[0].lessonType.id).toEqual(1);
  });
  // not find a course due to filters on inner join (included relations with filters on relations - deep, include added also)
  it('should not find a course due to filters on inner join (included relations with filters on relations - deep, include added also)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?` +
        `filters[lessons.lessonType.name][$like]=${encodeURIComponent('%Intro%')}&` +
        'include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - deep, include not added at lvl 1)
  it('should throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - deep, include not added at lvl 1)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?filters[lessons.lessonType.id]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course.lessons (course__lessons).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - deep, include not added at lvl 2)
  it('should throw a forbidden relation error when trying to find a course in the DB (included relations with filters on relations - deep, include not added at lvl 2)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?filters[lessons.lessonType.id]=1&include[]=lessons`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilder][course]: Forbidden include item course__lessons.lessonType (course__lessons__lessonType).'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // not find a course in the cache by id if it doesn't exist
  it("should not find a course in the cache by id if it doesn't exist", async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/100?dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the cache by id (no filters)
  it('should find a course in the cache by id (no filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // TODO: not find a course in the cache by id if there is no match (simple filters)
  it.skip('should not find a course in the cache by id if there is no match (simple filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        'filters[courseTypeId]=105',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the cache by id (simple filters)
  it('should find a course in the cache by id (simple filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        'filters[courseTypeId]=1',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result.courseTypeId).toEqual(1);
  });
  // TODO: not find a course in the cache by id if there is no match (array of filters)
  it.skip('should not find a course in the cache by id if there is no match (array of filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        'filters[courseTypeId][]=105&filters[courseTypeId][]=185',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the cache by id (array of filters)
  it('should find a course in the cache by id (array of filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        'filters[courseTypeId][]=1&filters[courseTypeId][]=2',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result.courseTypeId).toEqual(1);
  });
  // TODO: complex filters, such as $and, $or, $like when support for this is added for the cache
  // ----
  // -- end of admin cases - single-service findOne
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - bulkCreate
  // ----
  // bulk create courses in the DB
  it('should bulk create courses in the DB', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateBody = await dataPreBulkCreate.json();
    const benchmarkOldId = dataPreBulkCreateBody.result.items[0].id + 2;
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test bulk create course'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2'
            },
            {
              courseTypeId: 1,
              name: 'Test bulk create course 3'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 4'
            },
            {
              courseTypeId: 1,
              name: 'Test bulk create course 5'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 6'
            }
          ]
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(responseBody.result[i].id).toEqual(benchmarkOldId + i);
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
    }
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateBody = await dataPostBulkCreate.json();
    expect(dataPostBulkCreateBody.result.items.length).toEqual(
      dataPreBulkCreateBody.result.items.length + 6
    );
  });
  // throw an error for a duplicate in one of the items - no items should be created
  it('should throw an error for a duplicate in one of the items - no items should be created', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateBody = await dataPreBulkCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test create course'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2'
            }
          ]
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      "[RBDEntityService][ER_DUP_ENTRY]: Duplicate entry '1-Test create course' for key 'COURSES_UNIQUE_IDX_0'."
    );
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateBody = await dataPostBulkCreate.json();
    expect(dataPostBulkCreateBody.result.items.length).toEqual(
      dataPreBulkCreateBody.result.items.length
    );
  });
  // throw an error for a missing field in one of the items - no items should be created
  it('should throw an error for a missing field in one of the items - no items should be created', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateBody = await dataPreBulkCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test create course nofail'
            },
            {
              courseTypeId: 2
            }
          ]
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      "[RBDEntityService][ER_NO_DEFAULT_FOR_FIELD]: Field 'name' doesn't have a default value."
    );
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateBody = await dataPostBulkCreate.json();
    expect(dataPostBulkCreateBody.result.items.length).toEqual(
      dataPreBulkCreateBody.result.items.length
    );
  });
  // bulk create courses in the cache
  it('should bulk create courses in the cache', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateBody = await dataPreBulkCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test bulk create course'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2'
            }
          ],
          dataServices: ['cache']
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(2);
    expect(responseBody.result[0].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id + 1
    );
    expect(responseBody.result[0].courseTypeId).toEqual(1);
    expect(responseBody.result[0].name).toEqual('Test bulk create course');
    expect(responseBody.result[1].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id + 2
    );
    expect(responseBody.result[1].courseTypeId).toEqual(2);
    expect(responseBody.result[1].name).toEqual('Test bulk create course 2');
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateBody = await dataPostBulkCreate.json();
    expect(dataPostBulkCreateBody.result.items.length).toEqual(
      dataPreBulkCreateBody.result.items.length + 2
    );
  });
  // TODO: bulk create courses in the DB, then the cache using the input data - when the relevant functionality is implemented in the DomainEntityService
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)
  it("should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)", async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    // it's +3 here, instead of +1, due to the errors being thrown in the previous tests increasing the auto-increment
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 3;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test bulk create course - 2 services, variant 1'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2 - 2 services, variant 1'
            }
          ],
          dataServices: ['main', 'cache']
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(2);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(Object.keys(responseBody.resultsByService).length).toEqual(0);
    for (let i = 0; i < 2; i++) {
      expect(responseBody.result[i].id).toEqual(benchmarkOldIdDB + i);
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
    }
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length
    );
  });
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true
  it('should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true', async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 1;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test bulk create course - 2 services, variant 2'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2 - 2 services, variant 2'
            }
          ],
          dataServices: ['main', 'cache'],
          optionsOverridesPerService: {
            cache: { runOnNoFirstServiceResultOnly: true }
          }
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(2);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(Object.keys(responseBody.resultsByService).length).toEqual(0);
    for (let i = 0; i < 2; i++) {
      expect(responseBody.result[i].id).toEqual(benchmarkOldIdDB + i);
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
    }
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length
    );
  });
  // bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false
  it('should bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false', async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 1;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/bulk`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              courseTypeId: 1,
              name: 'Test bulk create course - 2 services, variant 3'
            },
            {
              courseTypeId: 2,
              name: 'Test bulk create course 2 - 2 services, variant 3'
            }
          ],
          dataServices: ['main', 'cache'],
          optionsOverridesByService: {
            cache: { runOnNoFirstServiceResultOnly: false }
          }
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(2);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('cache');
    expect(responseBody.resultsByService.cache).toHaveLength(2);
    for (let i = 0; i < 2; i++) {
      expect(responseBody.result[i].id).toEqual(benchmarkOldIdDB + i);
      expect(responseBody.result[i].id).toEqual(
        responseBody.resultsByService.cache[i].id
      );
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
      expect(responseBody.result[i].courseTypeId).toEqual(
        responseBody.resultsByService.cache[i].courseTypeId
      );
      expect(responseBody.result[i].name).toEqual(
        responseBody.resultsByService.cache[i].name
      );
    }
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length + 2
    );
  });
  // ----
  // -- end of admin cases - bulkCreate
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - multi-service findOne
  // ----
  // find a course in the db that does not exist in the cache, by id - when the first service is the cache
  it('should find a course in the db that does not exist in the cache, by id - when the first service is the cache', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=cache&dataServices[]=main`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main.id).toEqual(11);
  });
  // not find a course in the cache, look for it in the DB, find it and create it in the cache using the DB data
  it('should not find a course in the cache, look for it in the DB, find it and create it in the cache using the DB data', async () => {
    const dataPreCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateCacheBody = await dataPreCreateCache.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=cache&dataServices[]=main&` +
        'saveAdditionalResultsInFirstService[serviceName]=main&',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main.id).toEqual(11);
    const dataPostCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateCacheBody = await dataPostCreateCache.json();
    expect(dataPostCreateCacheBody.result.items.length).toEqual(
      dataPreCreateCacheBody.result.items.length + 1
    );
    expect(
      (dataPostCreateCacheBody.result.items as { id: number }[]).find(
        (item) => item.id === 11
      )?.id
    ).toEqual(11);
  });
  // find a course in the DB and retrieve its data from the cache
  it('should find a course in the DB and retrieve its data from the cache', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=main&dataServices[]=cache&` +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=false&',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(11);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('cache');
    expect(responseBody.resultsByService.cache.id).toEqual(11);
  });
  // ----
  // -- end of admin cases - multi-service findOne
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - update
  // ----
  // update courses in the DB - filter by id only, 1 item - and return count only by default
  it('should update courses in the DB - filter by id only, 1 item - and return count only by default', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test bulk create course updated'
          },
          filters: { id: dataPreUpdateBody.result.items[0].id }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result.items).toBeUndefined();
    expect(responseBody.result.originalItems).toBeUndefined();
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    expect(dataPostUpdateBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(dataPostUpdateBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(dataPostUpdateBody.result.items[0].name).toEqual(
      'Test bulk create course updated'
    );
  });
  // update courses in the DB - filter by id only, 1 item - and return updated data if specified
  it('should update courses in the DB - filter by id only, 1 item - and return updated data if specified', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test bulk create course updated again'
          },
          filters: { id: dataPreUpdateBody.result.items[0].id },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    expect(responseBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(responseBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(responseBody.result.items[0].name).toEqual(
      'Test bulk create course updated again'
    );
    expect(responseBody.result.originalItems).toBeUndefined();
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    expect(dataPostUpdateBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(dataPostUpdateBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(dataPostUpdateBody.result.items[0].name).toEqual(
      'Test bulk create course updated again'
    );
  });
  // update courses in the DB - filter by id only, 1 item - and return both the updated and the original data if specified
  it('should update courses in the DB - filter by id only, 1 item - and return both the updated and the original data if specified', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateBody = await dataPreBulkCreate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test bulk create course updated again and again'
          },
          filters: { id: dataPreBulkCreateBody.result.items[0].id },
          returnOriginalItems: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result.items).toBeUndefined();
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(1);
    expect(responseBody.result.originalItems[0].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id
    );
    expect(responseBody.result.originalItems[0].courseTypeId).toEqual(
      dataPreBulkCreateBody.result.items[0].courseTypeId
    );
    expect(responseBody.result.originalItems[0].name).toEqual(
      dataPreBulkCreateBody.result.items[0].name
    );
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateBody = await dataPostBulkCreate.json();
    expect(dataPostBulkCreateBody.result.items.length).toEqual(
      dataPreBulkCreateBody.result.items.length
    );
    expect(dataPostBulkCreateBody.result.items[0].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id
    );
    expect(dataPostBulkCreateBody.result.items[0].courseTypeId).toEqual(
      dataPreBulkCreateBody.result.items[0].courseTypeId
    );
    expect(dataPostBulkCreateBody.result.items[0].name).toEqual(
      'Test bulk create course updated again and again'
    );
  });
  // update courses in the DB - filter by id only, 1 item - and return both the updated and the original data if specified
  it('should update courses in the DB - filter by id only, 1 item - and return both the updated and the original data if specified', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test bulk create course updated again final'
          },
          filters: { id: dataPreUpdateBody.result.items[0].id },
          returnData: true,
          returnOriginalItems: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    expect(responseBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(responseBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(responseBody.result.items[0].name).toEqual(
      'Test bulk create course updated again final'
    );
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(1);
    expect(responseBody.result.originalItems[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(responseBody.result.originalItems[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(responseBody.result.originalItems[0].name).toEqual(
      dataPreUpdateBody.result.items[0].name
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    expect(dataPostUpdateBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(dataPostUpdateBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(dataPostUpdateBody.result.items[0].name).toEqual(
      'Test bulk create course updated again final'
    );
  });
  // throw an error when trying to update courses in the DB without filters
  it('should throw an error when trying to update courses in the DB without filters', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will fail'
          },
          filters: {}
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('filters must be a non-empty object');
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // throw a validation error when trying to update courses in the DB with duplicate unique fields
  it('should throw a validation error when trying to update courses in the DB with duplicate unique fields', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    // copy the unique fields (courseTypeId + name) of another existing course
    const existingCourse = preItems[1];
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            courseTypeId: existingCourse.courseTypeId,
            name: existingCourse.name
          },
          filters: { id: preItems[0].id }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      `[RBDEntityService][ER_DUP_ENTRY]: Duplicate entry '${existingCourse.courseTypeId}-${existingCourse.name}' for key 'COURSES_UNIQUE_IDX_0'.`
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // throw an error when trying to update courses in the DB with a null value inside a simple array filter
  it('should throw an error when trying to update courses in the DB with a null value inside a simple array filter', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will fail'
          },
          filters: { id: [dataPreUpdateBody.result.items[0].id, null] }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][courses]: Invalid simple array filter on field id  (alias: id) - cannot contain null values.'
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // throw an error when trying to update courses in the DB with filters nested deeper than the max depth
  it('should throw an error when trying to update courses in the DB with filters nested deeper than the max depth', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    // every array level adds 1 to the depth, except for the innermost simple array - 12 levels reach depth 11 (max is 10)
    let nestedIdFilter: unknown[] = [dataPreUpdateBody.result.items[0].id];
    for (let i = 0; i < 11; i++) {
      nestedIdFilter = [nestedIdFilter];
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will fail'
          },
          filters: { id: nestedIdFilter }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[SQLQueryBuilderService][courses]: Max depth of 10 exceeded.'
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // update courses in the DB - filter by id + other fields - simple filters
  it('should update courses in the DB - filter by id + other fields - simple filters', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test update course - simple filters'
          },
          filters: {
            courseTypeId: dataPreUpdateBody.result.items[0].courseTypeId,
            id: dataPreUpdateBody.result.items[0].id
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    expect(responseBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(responseBody.result.items[0].courseTypeId).toEqual(
      dataPreUpdateBody.result.items[0].courseTypeId
    );
    expect(responseBody.result.items[0].name).toEqual(
      'Test update course - simple filters'
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    expect(dataPostUpdateBody.result.items[0].id).toEqual(
      dataPreUpdateBody.result.items[0].id
    );
    expect(dataPostUpdateBody.result.items[0].name).toEqual(
      'Test update course - simple filters'
    );
    expect(dataPostUpdateBody.result.items.slice(1)).toEqual(
      dataPreUpdateBody.result.items.slice(1)
    );
  });
  // update courses in the DB - filter by id + other fields - array of filters
  it('should update courses in the DB - filter by id + other fields - array of filters', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    // the two courses must have different course types, so that the new name doesn't break the unique index
    const firstCourse = preItems[0];
    const secondCourse = preItems.find(
      (item) => item.courseTypeId !== firstCourse.courseTypeId
    ) as TestCourse;
    const courseIds = [firstCourse.id, secondCourse.id];
    const expectedItems = new Map<number, TestCourse>([
      [firstCourse.id, firstCourse],
      [secondCourse.id, secondCourse]
    ]);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test update course - array of filters'
          },
          filters: {
            courseTypeId: [firstCourse.courseTypeId, secondCourse.courseTypeId],
            id: courseIds
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(2);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    const updatedItems: TestCourse[] = responseBody.result.items;
    for (const i in updatedItems) {
      const item = updatedItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.name).toEqual('Test update course - array of filters');
    }
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    for (const i in postItems) {
      const item = postItems[i];
      if (expectedItems.has(item.id)) {
        expect(item.name).toEqual('Test update course - array of filters');
        continue;
      }
      expect(item).toEqual(preItems[i]);
    }
  });
  // update courses in the DB - filter by id + other fields - $and operator on a field
  it('should update courses in the DB - filter by id + other fields - $and operator on a field', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    const courseTypeId = preItems[0].courseTypeId;
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id >= lowId &&
        item.id <= highId &&
        item.courseTypeId === courseTypeId
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            categoryId: 1
          },
          filters: {
            courseTypeId,
            id: { $and: [{ $gte: lowId }, { $lte: highId }] }
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(expectedItems.size);
    const updatedItems: TestCourse[] = responseBody.result.items;
    for (const i in updatedItems) {
      const item = updatedItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.categoryId).toEqual(1);
    }
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    for (const i in postItems) {
      const item = postItems[i];
      if (expectedItems.has(item.id)) {
        expect(item.categoryId).toEqual(1);
        continue;
      }
      expect(item).toEqual(preItems[i]);
    }
  });
  // update courses in the DB - filter by id + other fields - $or operator on a field
  it('should update courses in the DB - filter by id + other fields - $or operator on a field', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    // the courseTypeId filter should exclude the second course, matched by the $or operator
    const firstCourse = preItems[0];
    const secondCourse = preItems.find(
      (item) => item.courseTypeId !== firstCourse.courseTypeId
    ) as TestCourse;
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'Test update course - $or operator'
          },
          filters: {
            courseTypeId: firstCourse.courseTypeId,
            id: { $or: [firstCourse.id, secondCourse.id] }
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    expect(responseBody.result.items[0].id).toEqual(firstCourse.id);
    expect(responseBody.result.items[0].name).toEqual(
      'Test update course - $or operator'
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    expect(dataPostUpdateBody.result.items[0].id).toEqual(firstCourse.id);
    expect(dataPostUpdateBody.result.items[0].name).toEqual(
      'Test update course - $or operator'
    );
    expect(dataPostUpdateBody.result.items.slice(1)).toEqual(
      dataPreUpdateBody.result.items.slice(1)
    );
  });
  // update courses in the DB - filter by id + other fields - $gt and $lt operators on a field
  it('should update courses in the DB - filter by id + other fields - $gt and $lt operators on a field', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    const courseTypeId = preItems[0].courseTypeId;
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id > lowId &&
        item.id < highId &&
        item.courseTypeId === courseTypeId
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            categoryId: 1
          },
          filters: {
            courseTypeId,
            id: { $gt: lowId, $lt: highId }
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(expectedItems.size);
    const updatedItems: TestCourse[] = responseBody.result.items;
    for (const i in updatedItems) {
      const item = updatedItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.categoryId).toEqual(1);
    }
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    for (const i in postItems) {
      const item = postItems[i];
      if (expectedItems.has(item.id)) {
        expect(item.categoryId).toEqual(1);
        continue;
      }
      expect(item).toEqual(preItems[i]);
    }
  });
  // update courses in the DB - filter by id + other fields - $gte and $lte operators on a field
  it('should update courses in the DB - filter by id + other fields - $gte and $lte operators on a field', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    // use the other course type, compared to the $gt and $lt case
    const courseTypeId = (
      preItems.find(
        (item) => item.courseTypeId !== preItems[0].courseTypeId
      ) as TestCourse
    ).courseTypeId;
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id >= lowId &&
        item.id <= highId &&
        item.courseTypeId === courseTypeId
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            categoryId: 1
          },
          filters: {
            courseTypeId,
            id: { $gte: lowId, $lte: highId }
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(expectedItems.size);
    const updatedItems: TestCourse[] = responseBody.result.items;
    for (const i in updatedItems) {
      const item = updatedItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.categoryId).toEqual(1);
    }
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    for (const i in postItems) {
      const item = postItems[i];
      if (expectedItems.has(item.id)) {
        expect(item.categoryId).toEqual(1);
        continue;
      }
      expect(item).toEqual(preItems[i]);
    }
  });
  // update courses in the DB - filter by id + other fields - full range of filters
  it('should update courses in the DB - filter by id + other fields - full range of filters', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    const firstCourse = preItems[0];
    const firstCourseTypeId = firstCourse.courseTypeId;
    const secondCourseTypeId = (
      preItems.find(
        (item) => item.courseTypeId !== firstCourse.courseTypeId
      ) as TestCourse
    ).courseTypeId;
    const courseTypeIds = [firstCourseTypeId, secondCourseTypeId];
    const courseTypeIdsMap = new Map<number, boolean>([
      [firstCourseTypeId, true],
      [secondCourseTypeId, true]
    ]);
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id >= lowId &&
        item.id <= highId &&
        item.id !== firstCourse.id &&
        courseTypeIdsMap.has(item.courseTypeId) &&
        item.name.includes('Test')
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            categoryId: 1
          },
          filters: {
            courseTypeId: courseTypeIds,
            id: {
              $and: [{ $gte: lowId }, { $lte: highId }],
              $not: [firstCourse.id]
            },
            name: { $like: '%Test%' }
          },
          returnData: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(expectedItems.size);
    const updatedItems: TestCourse[] = responseBody.result.items;
    for (const i in updatedItems) {
      const item = updatedItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.categoryId).toEqual(1);
    }
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items.length).toEqual(
      dataPreUpdateBody.result.items.length
    );
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    for (const i in postItems) {
      const item = postItems[i];
      if (expectedItems.has(item.id)) {
        expect(item.categoryId).toEqual(1);
        continue;
      }
      expect(item).toEqual(preItems[i]);
    }
  });
  // not update any courses in the DB if no items are found - and return empty data if specified
  it('should not update any courses in the DB if no items are found - and return empty data if specified', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will not be applied'
          },
          // returnOriginalItems forces the search for the items before the update
          filters: {
            courseTypeId: 1758,
            id: dataPreUpdateBody.result.items[0].id
          },
          returnData: true,
          returnOriginalItems: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(0);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(0);
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(0);
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // not update any courses in the DB if no items are found - and return empty original data only if specified
  it('should not update any courses in the DB if no items are found - and return empty original data only if specified', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will not be applied'
          },
          filters: {
            courseTypeId: 1758,
            id: dataPreUpdateBody.result.items[0].id
          },
          returnOriginalItems: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(0);
    expect(responseBody.result).not.toHaveProperty('items');
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(0);
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // not update any courses in the DB if no items are found due to relation filters - and return count only by default
  it('should not update any courses in the DB if no items are found due to relation filters - and return count only by default', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will not be applied'
          },
          filters: {
            'courseType.id': 1758,
            id: dataPreUpdateBody.result.items[0].id
          }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(0);
    expect(responseBody.result).not.toHaveProperty('items');
    expect(responseBody.result).not.toHaveProperty('originalItems');
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // update courses in the DB - filter by id + relation fields - and return both the updated and the original data without the relations
  it('should update courses in the DB - filter by id + relation fields - and return both the updated and the original data without the relations', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    const courseToUpdate = preItems[0];
    const newName = 'Test update course - relation filters';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: newName
          },
          filters: {
            'courseType.id': courseToUpdate.courseTypeId,
            id: courseToUpdate.id
          },
          returnData: true,
          returnOriginalItems: true
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(1);
    const [updatedItem] = responseBody.result.items;
    expect(updatedItem.id).toEqual(courseToUpdate.id);
    expect(updatedItem.name).toEqual(newName);
    // the relations joined for the search must be removed from the returned data
    expect(updatedItem).not.toHaveProperty('courseType');
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(1);
    const [originalItem] = responseBody.result.originalItems;
    expect(originalItem.id).toEqual(courseToUpdate.id);
    expect(originalItem.name).toEqual(courseToUpdate.name);
    expect(originalItem).not.toHaveProperty('courseType');
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    expect(postItems.length).toEqual(preItems.length);
    expect(postItems[0].id).toEqual(courseToUpdate.id);
    expect(postItems[0].name).toEqual(newName);
    expect(postItems.slice(1)).toEqual(preItems.slice(1));
  });
  // update courses in the cache - filter by id only
  it('should update courses in the cache - filter by id only', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    expect(preItems.length).toBeGreaterThan(0);
    const courseToUpdate = preItems[0];
    const preItemsById = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      preItemsById.set(item.id, item);
    }
    const newName = 'Test update course in the cache';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: newName
          },
          dataServices: ['cache'],
          filters: { id: courseToUpdate.id }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result).not.toHaveProperty('items');
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    const postItems: TestCourse[] = dataPostUpdateBody.result.items;
    expect(postItems.length).toEqual(preItems.length);
    for (const i in postItems) {
      const item = postItems[i];
      if (item.id === courseToUpdate.id) {
        expect(item).toEqual({ ...courseToUpdate, name: newName });
        continue;
      }
      expect(item).toEqual(preItemsById.get(item.id));
    }
  });
  // throw an error when trying to update courses in the cache without an id filter
  it('should throw an error when trying to update courses in the cache without an id filter', async () => {
    const dataPreUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreUpdateBody = await dataPreUpdate.json();
    const preItems: TestCourse[] = dataPreUpdateBody.result.items;
    expect(preItems.length).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'This will fail'
          },
          dataServices: ['cache'],
          filters: { name: preItems[0].name }
        }),
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Find Error]: The primary key field id is required when requirePrimaryKeys is set to true.'
    );
    const dataPostUpdate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostUpdateBody = await dataPostUpdate.json();
    expect(dataPostUpdateBody.result.items).toEqual(
      dataPreUpdateBody.result.items
    );
  });
  // TODO: update courses in the cache - filter by id + other fields (all filtering options from find that are relevant to the cache)
  // ----
  // -- end of admin cases - update
  // ----

  // ###########################################################################################

  // ----
  // -- start of admin cases - delete
  // ----
  // throw a not found error when trying to delete users, since the delete route is not enabled in the users controller
  it('should throw a not found error when trying to delete users, since the delete route is not enabled in the users controller', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { id: dataPreDeleteBody.result.items[0].id }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Not found');
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(HttpStatus.NOT_FOUND);
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?findAll=true`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    expect(dataPostDeleteBody.result.items).toEqual(
      dataPreDeleteBody.result.items
    );
  });
  // throw an error when trying to delete login logs of the admin user (not implemented for ClickHouse)
  it('should throw an error when trying to delete login logs of the admin user (not implemented for ClickHouse)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { datetime: adminLoginLogs[0].datetime }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.delete not implemented.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    expect(dataPostDeleteBody.result.items).toEqual(adminLoginLogs);
  });
  // delete courses in the DB - filter by id
  it('should delete courses in the DB - filter by id', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    const courseToDelete = preItems[0];
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { id: courseToDelete.id }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result.originalItems).toBeUndefined();
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    // the deleted course was the first one, so the rest should remain the same
    expect(dataPostDeleteBody.result.items).toEqual(preItems.slice(1));
  });
  // throw an error when trying to delete courses in the DB without filters
  it('should throw an error when trying to delete courses in the DB without filters', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: {}
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('filters must be a non-empty object');
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    expect(dataPostDeleteBody.result.items).toEqual(
      dataPreDeleteBody.result.items
    );
  });
  // delete courses in the DB - filter by id + other fields (all filtering options from find)
  it('should delete courses in the DB - filter by id + other fields (all filtering options from find)', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    const firstCourse = preItems[0];
    const firstCourseTypeId = firstCourse.courseTypeId;
    const secondCourseTypeId = (
      preItems.find(
        (item) => item.courseTypeId !== firstCourse.courseTypeId
      ) as TestCourse
    ).courseTypeId;
    const courseTypeIds = [firstCourseTypeId, secondCourseTypeId];
    const courseTypeIdsMap = new Map<number, boolean>([
      [firstCourseTypeId, true],
      [secondCourseTypeId, true]
    ]);
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id >= lowId &&
        item.id <= highId &&
        item.id !== firstCourse.id &&
        courseTypeIdsMap.has(item.courseTypeId) &&
        item.name.includes('Test')
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: {
            courseTypeId: courseTypeIds,
            id: {
              $and: [{ $gte: lowId }, { $lte: highId }],
              $not: [firstCourse.id]
            },
            name: { $like: '%Test%' }
          },
          returnOriginalItems: true
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(expectedItems.size);
    const originalItems: TestCourse[] = responseBody.result.originalItems;
    for (const i in originalItems) {
      const item = originalItems[i];
      expect(item).toEqual(expectedItems.get(item.id));
    }
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    const expectedPostItems: TestCourse[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        expectedPostItems.push(item);
      }
    }
    expect(dataPostDeleteBody.result.items).toEqual(expectedPostItems);
  });
  // delete courses in the DB - filter by id + a field of a relation (shallow)
  it('should delete courses in the DB - filter by id + a field of a relation (shallow)', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    const courseTypeId = preItems[0].courseTypeId;
    const highId = preItems[0].id;
    const lowId = preItems[5].id;
    const expectedItems = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      if (
        item.id >= lowId &&
        item.id <= highId &&
        item.courseTypeId === courseTypeId
      ) {
        expectedItems.set(item.id, item);
      }
    }
    expect(expectedItems.size).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: {
            'courseType.id': courseTypeId,
            id: { $gte: lowId, $lte: highId }
          },
          returnOriginalItems: true
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedItems.size);
    expect(responseBody.result).toHaveProperty('originalItems');
    expect(responseBody.result.originalItems).toHaveLength(expectedItems.size);
    // the original items are found with the relation included, so only the relevant fields are compared
    const originalItems: (TestCourse & { courseType: { id: number } })[] =
      responseBody.result.originalItems;
    for (const i in originalItems) {
      const item = originalItems[i];
      expect(expectedItems.has(item.id)).toEqual(true);
      expect(item.courseType.id).toEqual(courseTypeId);
    }
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    const expectedPostItems: TestCourse[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        expectedPostItems.push(item);
      }
    }
    expect(dataPostDeleteBody.result.items).toEqual(expectedPostItems);
  });
  // delete courses in the DB - filter by id + a field of a relation (deep)
  it('should delete courses in the DB - filter by id + a field of a relation (deep)', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    // find a course that has at least one lesson of the given lesson type
    const lessonTypeId = 1;
    const matchingCourses = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[lessons.lessonType.id]=${lessonTypeId}&` +
        'include[]=lessons&include[]=lessons.lessonType',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const matchingCoursesBody = await matchingCourses.json();
    expect(matchingCoursesBody.result.items.length).toBeGreaterThan(0);
    const courseToDelete: TestCourse = matchingCoursesBody.result.items[0];
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: {
            id: courseToDelete.id,
            'lessons.lessonType.id': lessonTypeId
          }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    const expectedPostItems: TestCourse[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (item.id !== courseToDelete.id) {
        expectedPostItems.push(item);
      }
    }
    expect(dataPostDeleteBody.result.items).toEqual(expectedPostItems);
  });
  // not delete any courses in the DB due to inner join filters - filter by id + a field of a relation (deep)
  it('should not delete any courses in the DB due to inner join filters - filter by id + a field of a relation (deep)', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: {
            id: preItems[0].id,
            'lessons.lessonType.id': 1758
          }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(0);
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    expect(dataPostDeleteBody.result.items).toEqual(preItems);
  });
  // delete courses in the cache - filter by id
  it('should delete courses in the cache - filter by id', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    expect(preItems.length).toBeGreaterThan(0);
    const courseToDelete = preItems[0];
    const preItemsById = new Map<number, TestCourse>();
    for (const i in preItems) {
      const item = preItems[i];
      preItemsById.set(item.id, item);
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          dataServices: ['cache'],
          filters: { id: courseToDelete.id }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(1);
    expect(responseBody.result.originalItems).toBeUndefined();
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    const postItems: TestCourse[] = dataPostDeleteBody.result.items;
    expect(postItems.length).toEqual(preItems.length - 1);
    for (const i in postItems) {
      const item = postItems[i];
      expect(item.id).not.toEqual(courseToDelete.id);
      expect(item).toEqual(preItemsById.get(item.id));
    }
  });
  // throw an error when trying to delete courses in the cache without an id filter
  it('should throw an error when trying to delete courses in the cache without an id filter', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    expect(preItems.length).toBeGreaterThan(0);
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          dataServices: ['cache'],
          filters: { name: preItems[0].name }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Find Error]: The primary key field id is required when requirePrimaryKeys is set to true.'
    );
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    expect(dataPostDeleteBody.result.items).toEqual(
      dataPreDeleteBody.result.items
    );
  });
  // delete courses in the cache - filter by id + simple field
  it('should delete courses in the cache - filter by id + simple field', async () => {
    const dataPreDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreDeleteBody = await dataPreDelete.json();
    const preItems: TestCourse[] = dataPreDeleteBody.result.items;
    expect(preItems.length).toBeGreaterThan(1);
    const candidateItems = [preItems[0], preItems[1]];
    const { courseTypeId } = preItems[0];
    const candidateIds: number[] = [];
    const expectedDeletedItems = new Map<number, TestCourse>();
    for (const i in candidateItems) {
      const item = candidateItems[i];
      candidateIds.push(item.id);
      if (item.courseTypeId === courseTypeId) {
        expectedDeletedItems.set(item.id, item);
      }
    }
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          dataServices: ['cache'],
          filters: { courseTypeId, id: candidateIds },
          returnOriginalItems: true
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('count');
    expect(responseBody.result.count).toEqual(expectedDeletedItems.size);
    expect(responseBody.result).toHaveProperty('originalItems');
    const originalItems: TestCourse[] = responseBody.result.originalItems;
    expect(originalItems).toHaveLength(expectedDeletedItems.size);
    for (const i in originalItems) {
      const item = originalItems[i];
      expect(item).toEqual(expectedDeletedItems.get(item.id));
    }
    const dataPostDelete = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostDeleteBody = await dataPostDelete.json();
    const postItems: TestCourse[] = dataPostDeleteBody.result.items;
    expect(postItems.length).toEqual(
      preItems.length - expectedDeletedItems.size
    );
    for (const i in postItems) {
      expect(expectedDeletedItems.has(postItems[i].id)).toEqual(false);
    }
  });
  // TODO: delete courses in the cache - filter by id + other fields (all filtering options from find that are relevant to the cache)
  // ----
  // -- end of admin cases - delete
  // ----

  // ###########################################################################################

  // ----
  // -- start of user 0 cases - login and find with mutation of input data
  // ----
  // log in as user 0
  it('should log user 0 in successfully', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: {
          password: 'User0Password'
        },
        filters: { email: 'user0@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    user0AccessToken = responseBody.accessToken;
    const user0Response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email]=${encodeURIComponent('user0@node-c.com')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const user0ResponseBody = await user0Response.json();
    user0Id = user0ResponseBody.result.items[0].id;
  });
  // find only the login logs of user 0 when no userId filter is provided - the authorization point adds it
  it('should find only the login logs of user 0 when no userId filter is provided', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    const items: TestUserLoginLog[] = responseBody.result.items;
    // at least the login from the previous case
    expect(items.length).toBeGreaterThan(0);
    for (const i in items) {
      expect(Number(items[i].userId)).toEqual(user0Id);
    }
    user0LoginLogs = items;
  });
  // find the login logs of user 0 when their own userId is provided as a filter
  it('should find the login logs of user 0 when their own userId is provided as a filter', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&filters[userId]=${user0Id}`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(user0LoginLogs);
  });
  // find only the login logs of user 0 when an array of userIds, including another user's, is provided as a filter
  it("should find only the login logs of user 0 when an array of userIds, including another user's, is provided as a filter", async () => {
    // the authorization point narrows the array down to the userId of the current user
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc&` +
        `filters[userId][]=${user0Id}&filters[userId][]=${adminUserId}`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.items).toEqual(user0LoginLogs);
  });
  // throw a forbidden error when user 0 tries to find the login logs of another user
  it('should throw a forbidden error when user 0 tries to find the login logs of another user', async () => {
    // the authorization point only allows the userId of the current user in the filters
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&filters[userId]=${adminUserId}`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // pass the authorization check when user 0 tries to delete their own login logs with a numeric userId filter
  it('should pass the authorization check when user 0 tries to delete their own login logs with a numeric userId filter', async () => {
    // the JSON body keeps the userId as a number, which the authorization point used to reject even when it matched;
    // the request then reaches ClickHouse, where deleting is not implemented
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { userId: user0Id }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.delete not implemented.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // pass the authorization check when user 0 tries to delete their own login logs without a userId filter
  it('should pass the authorization check when user 0 tries to delete their own login logs without a userId filter', async () => {
    // the authorization point adds the userId of the current user to the filters
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { datetime: user0LoginLogs[0].datetime }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      'Method ClickHouseSelectQueryBuilder.delete not implemented.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
  });
  // throw a forbidden error when user 0 tries to delete the login logs of another user
  it('should throw a forbidden error when user 0 tries to delete the login logs of another user', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          filters: { userId: adminUserId }
        }),
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: more error cases for authorization points
  // TODO: more success cases for authorization points
  // TODO: more mutation of input data
  // TODO: mutation of output data
  // ----
  // -- end of user 0 cases
  // ----
});
