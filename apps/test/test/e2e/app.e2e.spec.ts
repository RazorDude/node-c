/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
const BASE_URL_SSO = 'http://localhost:2081';

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
  // TODO: make sure query params are ignored in originalUrl
  // TODO: issue an access token - bad request on invalid body vs dto
  // TODO: issue an access token - invalid email & password (all cases)
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: sorting on multiple fields, including aliased ones
  // TODO: filters on aliased fields
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters: array of items with a $gt operator inside - demonstrates deeply nested filters capability)
  it.skip('should find users in the DB (filters: array of items with a $gt operator inside - demonstrates deeply nested filters capability)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][]=1&filters[id][]=4&filters[id][][$gt]=0&' +
        `filters[email][][$like]=${encodeURIComponent('%node-c.com%')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters - top-level $and operator on the same field)
  // TODO: find users in the DB (filters - top-level $and operator on different fields)
  it.skip('should find users in the DB (filters - top-level $and operator on different fields)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[$and][][accountStatusId]=1&filters[$and][][hasTakenIntro]=false',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters - top-level $and operator on different fields, with a nested $like operator inside)
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters - top-level $or operator on different fields)
  it.skip('should find users in the DB (filters - top-level $or operator on different fields)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[$or][][id]=1&filters[$or][][accountStatusId]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters - field + top-level $or operator)
  // TODO: find users in the DB (filters - top-level $and operator + top-level $or operator)
  // TODO: find users in the DB (filters - $ilike operator cases)
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find users in the DB (filters - $not operator ...can't remember the test case :D)
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(5);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, desc
    for (let i = 5; i >= 1; i--) {
      expect(responseBody.result.items[i-1].id).toEqual(i);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(5);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(5);
    // check the properties of the returned items - should be ordered by id, desc
    for (let i = 5; i >= 1; i--) {
      expect(responseBody.result.items[i-1].id).toEqual(i);
    }
  });
  // TODO: find in the cache with pagination and filters
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: find courses in the DB - select specific fields only, including aliased fields
  // TODO: add select to the test case below
  // find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search
  it('should find courses in the DB - full range of options (filters, included relations, ordering), NO multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'filters[courseType.id]=1&' +
        'filters[id][$gte]=1&' +
        'filters[id][$lte]=5&' +
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(2);
    expect(responseBody.result.items[0].id).toEqual(2);
    expect(responseBody.result.items[0]).toHaveProperty('courseType');
    expect(responseBody.result.items[0].courseType.id).toEqual(1);
    expect(responseBody.result.items[0]).toHaveProperty('lessons');
    expect(responseBody.result.items[0].lessons).toHaveLength(2);
    expect(responseBody.result.items[0].lessons[0].id).toEqual(5);
    expect(responseBody.result.items[0].lessons[1].id).toEqual(6);
    expect(responseBody.result.items[1].id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('courseType');
    expect(responseBody.result.items[1].courseType.id).toEqual(1);
    expect(responseBody.result.items[1]).toHaveProperty('lessons');
    expect(responseBody.result.items[1].lessons).toHaveLength(4);
    expect(responseBody.result.items[1].lessons[0].id).toEqual(1);
    expect(responseBody.result.items[1].lessons[1].id).toEqual(2);
    expect(responseBody.result.items[1].lessons[2].id).toEqual(3);
    expect(responseBody.result.items[1].lessons[3].id).toEqual(4);
  });
  // TODO: the above, but with findAll and filters
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Error]: Primary key filters are required when findAll and individualSearchEnabled are enabled in the find method.'
    );
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  });
  // TODO: all of the above tests except relations, but with the cache
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
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      "[RBDEntityService][ER_NO_REFERENCED_ROW_2]: Cannot add or update a child row: a foreign key constraint fails (`node_c_apps_test_main_e2e`.`courses`, CONSTRAINT `FK_7d0effe56712c9f8d73b99f319c` FOREIGN KEY (`courseTypeId`) REFERENCES `courseTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION)."
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(dataPreCreateBody.result.items[0].id + 2);
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length + 1);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length + 1);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    expect(responseCheckBody.result.items).toHaveLength(dataPreCreateBody.result.items.length + 2);
    const idsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      4: false
    }
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(3);
    const resultIdsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      4: false
    }
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
    }
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(5);
    const resultIdsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      3: false,
      4: false,
      6: false
    }
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
    expect(responseCheckBody.result.items).toHaveLength(dataPreCreateBody.result.items.length + 2);
    const idsToFind: Record<number, boolean> = {
      1: false,
      2: false,
      3: false,
      4: false,
      6: false
    }
    responseCheckBody.result.items.forEach((item: { id: number }) => {
      if (idsToFind[item.id] === false) {
        idsToFind[item.id] = true;
      }
    });
    for (const id in idsToFind) {
      expect(idsToFind[id]).toEqual(true);
    }
  });
  // TODO: test filters in optionsOverridesByService after fixing $and.
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // TODO: orderBy on included items
  // TODO: find a course in the DB (filters - top-level $and operator on the same field) - after $and is fixed
  // TODO: find a course in the DB (filters - top-level $and operator on different fields) - after $and is fixed
  // TODO: the above, but with $or
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
      `include[]=lessons`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull()
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
      `include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
      `include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull()
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
  });
  // TODO: not find a course in the cache by id if there is no match (simple filters)
  it.skip('should not find a course in the cache by id if there is no match (simple filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        `filters[courseTypeId]=105`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the cache by id (simple filters)
  it('should find a course in the cache by id (simple filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        `filters[courseTypeId]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result.courseTypeId).toEqual(1);
  });
  // TODO: not find a course in the cache by id if there is no match (array of filters)
  it.skip('should not find a course in the cache by id if there is no match (array of filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        `filters[courseTypeId][]=105&filters[courseTypeId][]=185`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toBeNull();
  });
  // find a course in the cache by id (array of filters)
  it('should find a course in the cache by id (array of filters)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/2?dataServices[]=cache&` +
        `filters[courseTypeId][]=1&filters[courseTypeId][]=2`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(2);
    expect(responseBody.result.courseTypeId).toEqual(1);
  });
  // TODO: complex filters, such as $and, $or, $like
  // ----
  // -- end of admin cases - single-service findOne
  // ----
  // ###########################################################################################
  // ----
  // -- start of admin cases - bulkCreate
  // ----
  // bulk create courses in the DB
  it('should bulk create courses in the DB', async () => {
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
    const benchmarkOldId = dataPreCreateBody.result.items[0].id + 2;
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length + 6);
  });
  // throw an error for a duplicate in one of the items - no items should be created
  it('should throw an error for a duplicate in one of the items - no items should be created', async () => {
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
  });
  // throw an error for a missing field in one of the items - no items should be created
  it('should throw an error for a missing field in one of the items - no items should be created', async () => {
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length);
  });
  // bulk create courses in the cache
  it('should bulk create courses in the cache', async () => {
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
    expect(responseBody.result[0].id).toEqual(dataPreCreateBody.result.items[0].id + 1);
    expect(responseBody.result[0].courseTypeId).toEqual(1);
    expect(responseBody.result[0].name).toEqual('Test bulk create course');
    expect(responseBody.result[1].id).toEqual(dataPreCreateBody.result.items[0].id + 2);
    expect(responseBody.result[1].courseTypeId).toEqual(2);
    expect(responseBody.result[1].name).toEqual('Test bulk create course 2');
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length + 2);
  });
  // TODO: bulk create courses in the DB, then the cache using the input data - when the relevant functionality is implemented in the DomainEntityService
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)
  it("should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)", async () => {
    const dataPreCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateDBBody = await dataPreCreateDB.json();
    // it's +3 here, instead of +1, due to the errors being thrown in the previous tests increasing the auto-increment
    const benchmarkOldIdDB = dataPreCreateDBBody.result.items[0].id + 3;
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
    const dataPostCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateDBBody = await dataPostCreateDB.json();
    expect(dataPostCreateDBBody.result.items.length).toEqual(dataPreCreateDBBody.result.items.length + 2);
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
    expect(dataPostCreateCacheBody.result.items.length).toEqual(dataPreCreateCacheBody.result.items.length);
  });
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true
  it("should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true", async () => {
    const dataPreCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateDBBody = await dataPreCreateDB.json();
    const benchmarkOldIdDB = dataPreCreateDBBody.result.items[0].id + 1;
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
    const dataPostCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateDBBody = await dataPostCreateDB.json();
    expect(dataPostCreateDBBody.result.items.length).toEqual(dataPreCreateDBBody.result.items.length + 2);
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
    expect(dataPostCreateCacheBody.result.items.length).toEqual(dataPreCreateCacheBody.result.items.length);
  });
  // bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false
  it('should bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false', async () => {
    const dataPreCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateDBBody = await dataPreCreateDB.json();
    const benchmarkOldIdDB = dataPreCreateDBBody.result.items[0].id + 1;
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
      expect(responseBody.result[i].id).toEqual(responseBody.resultsByService.cache[i].id);
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
      expect(responseBody.result[i].courseTypeId).toEqual(responseBody.resultsByService.cache[i].courseTypeId);
      expect(responseBody.result[i].name).toEqual(responseBody.resultsByService.cache[i].name);
    }
    const dataPostCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateDBBody = await dataPostCreateDB.json();
    expect(dataPostCreateDBBody.result.items.length).toEqual(dataPreCreateDBBody.result.items.length + 2);
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
    expect(dataPostCreateCacheBody.result.items.length).toEqual(dataPreCreateCacheBody.result.items.length + 2);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
    expect(dataPostCreateCacheBody.result.items.length).toEqual(dataPreCreateCacheBody.result.items.length + 1);
    expect((dataPostCreateCacheBody.result.items as { id: number }[]).find(item => item.id === 11)?.id).toEqual(11);
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
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.OK);
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
  // TODO: update courses in the DB - filter by id only
  it.skip('should update courses in the DB - filter by id only', async () => {
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
          ]
        }),
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveLength(2);
    expect(responseBody.result[0].id).toEqual(dataPreCreateBody.result.items[0].id + 2);
    expect(responseBody.result[0].courseTypeId).toEqual(1);
    expect(responseBody.result[0].name).toEqual('Test bulk create course');
    expect(responseBody.result[1].id).toEqual(dataPreCreateBody.result.items[0].id + 3);
    expect(responseBody.result[1].courseTypeId).toEqual(2);
    expect(responseBody.result[1].name).toEqual('Test bulk create course 2');
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
    expect(dataPostCreateBody.result.items.length).toEqual(dataPreCreateBody.result.items.length + 2);
  });
  // TODO: update courses in the DB - filter by id
  // TODO: throw an error when trying to update courses in the DB without an id filter
  // TODO: throw a validation error for duplicate unique fields
  // TODO: update courses in the DB - filter by id + other fields (all filtering options from find)
  // TODO: update courses in the cache - filter by id
  // TODO: throw an error when trying to update courses in the cache without an id filter
  // TODO: update courses in the cache - filter by id + other fields (all filtering options from find that are relevant to the cache)
  // ----
  // -- end of admin cases - update
  // ----
  // ###########################################################################################
  // ----
  // -- start of admin cases - delete
  // ----
  // TODO: delete courses in the DB - filter by id
  // TODO: throw an error when trying to delete courses in the DB without an id filter
  // TODO: delete courses in the DB - filter by id + other fields (all filtering options from find)
  // TODO: delete courses in the cache - filter by id
  // TODO: throw an error when trying to delete courses in the cache without an id filter
  // TODO: delete courses in the cache - filter by id + other fields (all filtering options from find that are relevant to the cache)
  // ----
  // -- end of admin cases - delete
  // ----
  // ###########################################################################################
  // TODO: confirm findAll when there are more entries than the default perPage=10 (at the end of the admin suites)
  // ----
  // -- start of user 0 cases - CRUD functionality, mutation of input and output data
  // ----
  // TODO: log in as user 0
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: error cases for authorization points
  // TODO: success cases for authorization points
  // TODO: mutation of input data
  // TODO: mutation of output data
  // ----
  // -- end of user 0 cases
  // ----
});
