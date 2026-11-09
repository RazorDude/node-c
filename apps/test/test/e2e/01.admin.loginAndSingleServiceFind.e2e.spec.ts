/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

import { TestUserLoginLog } from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_SSO,
  findUserByEmail
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - login and single-service find', () => {
  let adminAccessToken = '';
  let adminLoginLogs: TestUserLoginLog[] = [];
  let adminUserId = 0;
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
  // throw a not found error when calling a default route that is not enabled in the controller
  it('should throw a not found error when calling a default route that is not enabled in the controller', async () => {
    // the users controller only enables the find, findOne and update routes
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users`, {
      body: JSON.stringify({
        data: { email: 'not.created@node-c.com' }
      }),
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Not found');
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(HttpStatus.NOT_FOUND);
  });
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
    adminUserId = (await findUserByEmail(adminAccessToken, 'admin@node-c.com'))
      .id;
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
      expect(Number(items[i].userId)).toEqual(adminUserId);
    }
    // the datetime column has a precision of seconds, so multiple logins can share the same datetime
    for (let i = 1; i < items.length; i++) {
      expect(items[i].datetime >= items[i - 1].datetime).toEqual(true);
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
});
