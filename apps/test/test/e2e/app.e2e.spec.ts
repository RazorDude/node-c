import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
const BASE_URL_SSO = 'http://localhost:2081';

// Course Platform (Delegated) only;
// TODO: other apps' suites
describe('NodeC.Apps.Test.CoursePlatformDelegated', () => {
  let adminAccessToken = '';
  // ----
  // -- start of general checks
  // ----
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch(BASE_URL_SSO);
    expect(response.status).toEqual(401);
  });
  it('should return an error with status 401 when calling non-implemented routes', async () => {
    const response = await fetch(`${BASE_URL_SSO}/tokens`);
    expect(response.status).toEqual(401);
  });
  // TODO: make sure query params are ignored in originalUrl
  // TODO: issue an access token - bad request on invalid body vs dto
  // TODO: issue an access token - invalid email & password (all cases)
  // ----
  // -- end of general checks
  // ----
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
    expect(response.status).toEqual(201);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    adminAccessToken = responseBody.accessToken;
  });
  // TODO: non-enabled default routes
  // find users (no options)
  it('should find users (no options)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (pagination, page 1 - implicitly set)
  it('should find users (pagination, page 1 - implicitly set)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?perPage=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (pagination, page 1 - explicitly set)
  it('should find users (pagination, page 1 - explicitly set)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=1&perPage=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (pagination, page 2, perPage - implicitly set)
  it('should find users (pagination, page 2, perPage - implicitly set)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(10);
    expect(responseBody.result.more).toEqual(false);
    expect(responseBody.result.totalCount).toEqual(5);
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items.length).toEqual(0);
  });
  // find users (pagination, page 2, perPage - explicitly set)
  it('should find users (pagination, page 2, perPage - explicitly set)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?page=2&perPage=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (sorting)
  it('should find users (sorting)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?orderBy[id]=desc`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - simple)
  it('should find users (filters - simple)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id]=1`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - array of items)
  it('should find users (filters - array of items)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $like operator)
  it('should find users (filters - $like operator)', async () => {
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
    expect(response.status).toEqual(200);
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
  // find users (filters - array of items + $like operator)
  it('should find users (filters - array of items + $like operator)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'filters[id][]=1&filters[id][]=2&filters[id][]=3&filters[id][]=4' +
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
    expect(response.status).toEqual(200);
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
  // TODO: find users (filters - top-level $and operator on the same field
  // TODO: find users (filters - top-level $and operator on different fields)
  it.skip('should find users (filters - top-level $and operator on different fields)', async () => {
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
    console.log(responseBody.result.items);
    expect(response.status).toEqual(200);
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
  // TODO: find users (filters - top-level $and operator on different fields, with a nested $like operator inside)
  // TODO: find users (filters - $or operator inside a field)
  it('should find users (filters - $or operator inside a field)', async () => {
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
    expect(response.status).toEqual(200);
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
  // TODO: find users (filters - top-level $or operator on different fields)
  it.skip('should find users (filters - top-level $or operator on different fields)', async () => {
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
    console.log(responseBody.result.items);
    expect(response.status).toEqual(200);
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
  // TODO: find users (filters - field + top-level $or operator)
  // TODO: find users (filters - top-level $and operator + top-level $or operator)
  // TODO: find users (filters - $ilike operator cases)
  // find users (filters - $not operator inside a field, as a single value)
  it('should find users (filters - $not operator inside a field, as a single value)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$not][]=1`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $not operator inside a field, as an array)
  it('should find users (filters - $not operator inside a field, as an array)', async () => {
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
    expect(response.status).toEqual(200);
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
  // TODO: find users (filters - $not operator ...can't remember the test case :D)
  // find users (filters - $gt operator)
  it('should find users (filters - $gt operator)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gt]=1`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $gte operator)
  it('should find users (filters - $gte operator)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$gte]=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $lt operator)
  it('should find users (filters - $lt operator)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$lt]=5`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $lte operator)
  it('should find users (filters - $lte operator)', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[id][$lte]=2`, {
      headers: {
        authorization: `Bearer ${adminAccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
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
  // find users (filters - $between operator)
  it('should find users (filters - $between operator)', async () => {
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
    expect(response.status).toEqual(200);
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
  // find courses (included relations)
  it('should find courses (included relations)', async () => {
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
    expect(response.status).toEqual(200);
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
      item.lessons.forEach((lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
        expect(lesson).toHaveProperty('lessonType');
        expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
      });
    }
  });
  // find lessons (included relations with filters on relations - shallow, include added also)
  it('should find courses (included relations with filters on relations - shallow, include added also)', async () => {
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
    expect(response.status).toEqual(200);
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
      item.lessons.forEach((lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
        expect(lesson).toHaveProperty('lessonType');
        expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
      });
    }
  });
  // (forbidden relation error) find lessons (included relations with filters on relations - shallow, include not added)
  it('should throw an error on an attempt to find courses (included relations with filters on relations - shallow, include not added)', async () => {
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
  // (forbidden relation error) find courses (included relations with filters on relations - deep, include not added)
  it('should throw an error on an attempt to find courses (included relations with filters on relations - deep, include not added)', async () => {
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
  // find courses (included relations with filters on relations - deep, include added also)
  it('should find courses (included relations with filters on relations - deep, include added also)', async () => {
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
    expect(response.status).toEqual(200);
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
      item.lessons.forEach((lesson: { lessonTypeId: number; lessonType: { id: number } }) => {
        expect(lesson.lessonTypeId).toEqual(1);
        expect(lesson).toHaveProperty('lessonType');
        expect(lesson.lessonType.id).toEqual(lesson.lessonTypeId);
      });
    }
  });
  // TODO: find courses - select specific fields only, including aliased fields
  // TODO: add select to the test case below
  // find courses - full range of options (filters, included relations, ordering), NO multi-data-service search
  it('should find courses - full range of options (filters, included relations, ordering), NO multi-data-service search', async () => {
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
    expect(response.status).toEqual(200);
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
  // ----
  // -- end of admin cases - login and single-service find
  // ----
  // ----
  // -- start of admin cases - bulkCreate
  // ----
  // ----
  // -- end of admin cases - bulkCreate
  // ----
  // ----
  // -- start of admin cases - create and multi-service find
  // ----
  // create a course in the DB
  it('should create a course in the DB', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`, {
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
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(201);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(5);
    expect(responseBody.result.courseTypeId).toEqual(1);
    expect(responseBody.result.name).toEqual('Test create course');
  });
  // fail to create a course in the cache directly because a non-generated PK has not been provided
  it('should fail to create a course in the cache directly because a non-generated PK has not been provided', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`, {
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
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual(
      '[RedisRepositoryService course][Validation Error]: A value is required for generated PK column id when the generatePrimaryKeys is set to false or isArray is set to true.'
    );
  });
  // create a course in the cache directly
  it('should create a course in the cache directly if all data has been provided correctly', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`, {
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
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(201);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(4);
    expect(responseBody.result.courseTypeId).toEqual(3);
    expect(responseBody.result.name).toEqual('Cooking: A Day In Hell With Gordon Ramsey');
  });
  // search for courses in the cache and create using db data because its not in the cache (runOnFirstServiceResultOnly=true, saveAdditionalResultsInFirstService enabled with useResultsForFirstService=true)
  it('should search for courses in the cache and create using db data because its not in the cache (runOnFirstServiceResultOnly=true, saveAdditionalResultsInFirstService enabled with useResultsForFirstService=true)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'filters[id][]=1&filters[id][]=2&' +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=true' +
        'optionsOverridesByService[cache][individualSearch]=true&' +
        'saveAdditionalResultsInFirstService[serviceName]=main' +
        'saveAdditionalResultsInFirstService[useResultsForFirstService]=true',
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    console.log('==> [1]:', responseBody);
    console.log('==> [2]:', responseBody.result.items);
    expect(response.status).toEqual(200);
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
    expect(responseCheckBody.result.items).toHaveLength(2);
    expect(responseCheckBody.result.items[0].id).toEqual(1);
    expect(responseCheckBody.result.items[1].id).toEqual(2);
  });
  // throw an error
  // it('should throw an error when searching for courses in the cache using the db if findAll=true and filterByFirstServiceResultFields is not set (runOnFirstServiceResultOnly=false)', async () => {
  //   const response = await fetch(
  //     `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
  //       'dataServices[]=cache&dataServices[]=main&' +
  //       'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=true&' +
  //       'findAll=true',
  //     {
  //       headers: {
  //         authorization: `Bearer ${adminAccessToken}`,
  //         'content-type': 'application/json'
  //       },
  //       method: HttpMethod.GET
  //     }
  //   );
  //   // we expect multiple new items to be created
  //   const responseBody = await response.json();
  //   console.log('==> [3]:', responseBody);
  //   console.log('==> [4]:', responseBody.result.items);
  //   console.log('==> [5]:', responseBody.resultsByService.items);
  //   expect(response.status).toEqual(200);
  //   expect(responseBody).toHaveProperty('result');
  //   expect(responseBody.result).toHaveProperty('items');
  //   expect(responseBody.result.items).toHaveLength(8);
  //   expect(responseBody.result.items[0].id).toEqual(7);
  //   expect(responseBody.result.items[1].id).toEqual(8);
  //   expect(responseBody.result.items[2].id).toEqual(6);
  //   expect(responseBody).toHaveProperty('resultsByService');
  //   expect(responseBody.resultsByService).toHaveProperty('main');
  //   expect(responseBody.resultsByService.main).toHaveProperty('items');
  //   expect(responseBody.resultsByService.main.items).toHaveLength(7);
  //   expect(responseBody.resultsByService.main.items[0].id).toEqual(7);
  //   expect(responseBody.resultsByService.main.items[1].id).toEqual(6);
  //   expect(responseBody.resultsByService.main.items[1].id).toEqual(5);
  // });
  // search for courses in the cache and create using the db data all of the entries found in the DB (runOnFirstServiceResultOnly=false)
  // TODO: finish this
  it('should search for courses in the cache and create using the db data all of the entries found in the DB (runOnFirstServiceResultOnly=false)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?` +
        'dataServices[]=cache&dataServices[]=main&' +
        'optionsOverridesByService[cache][filterByFirstServiceResultFields][id]=id&' +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=true&' +
        'findAll=true',
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
    console.log('==> [3]:', responseBody);
    console.log('==> [4]:', responseBody.result.items);
    console.log('==> [5]:', responseBody.resultsByService.items);
    expect(response.status).toEqual(200);
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('items');
    expect(responseBody.result.items).toHaveLength(8);
    expect(responseBody.result.items[0].id).toEqual(7);
    expect(responseBody.result.items[1].id).toEqual(8);
    expect(responseBody.result.items[2].id).toEqual(6);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main).toHaveProperty('items');
    expect(responseBody.resultsByService.main.items).toHaveLength(7);
    expect(responseBody.resultsByService.main.items[0].id).toEqual(7);
    expect(responseBody.resultsByService.main.items[1].id).toEqual(6);
    expect(responseBody.resultsByService.main.items[1].id).toEqual(5);
  });
  // find users - full range of options (filters, included relations, ordering), multi-data-service search: filterByFirstServiceResultFields.id, runOnNoFirstServiceResultOnly=false, individualSearch=true
  // TODO: finish this
  it('should find users: full range of options (filters, included relations, ordering), multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'dataServices[]=main&dataServices[]=cache&' +
        'optionsOverridesByService[cache][filterByFirstServiceResultFields][id]=id&' +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=false&' +
        'optionsOverridesByService[cache][individualSearch]=true&' +
        `filters[createdAt][$gte]=${encodeURIComponent('2020-01-01 00:00:00')}&` +
        `filters[createdAt][$lte]=${encodeURIComponent('2030-01-01 00:00:00')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    console.log('==> [6]:', responseBody.result.items);
    expect(response.status).toEqual(200);
  });
  // TODO: update (incl. processManyToMany) and delete
  // TODO: refresh token flow
  // #######
  // ----
  // -- end of admin cases
  // ----
  // #######
  // -- start of user 0 cases - CRUD functionality, mutation of input and output data
  // TODO: log in as user 0
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: error cases for authorization points
  // TODO: mutation of input data
  // TODO: mutation of output data
  // -- end of user 0 cases
});
