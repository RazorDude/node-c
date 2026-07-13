import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
const BASE_URL_SSO = 'http://localhost:2081';

// Course Platform (Delegated) only;
// TODO: other apps' suites
describe('NodeC.Apps.Test.CoursePlatformDelegated', () => {
  let adminAccessToken = '';
  // -- start of general checks
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
  // -- end of general checks
  // -- start of admin cases
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
  // TODO: this should be Bad Request instead
  // (forbidden relation error) find lessons (included relations with filters on relations - shallow, include not added)
  it('should throw an error on an attempt to find courses (included relations with filters on relations - shallow, include not added)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseType.id]=1&'include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(500);
    // check the basic properties of the request
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual("Unknown column 'course__courseType.id' in 'where clause'");
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(500);
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
  // TODO: find users - full range of options (filters, included relations, ordering), NO multi-data-service search
  // find users - full range of options (filters, included relations, ordering), multi-data-service search: filterByFirstServiceResultFields.id, runOnNoFirstServiceResultOnly=false, individualSearch=true
  it('should find users: full range of options (filters, included relations, ordering), multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?` +
        'persistanceServices[]=main&persistanceServices[]=cache&' +
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
    expect(response.status).toEqual(200);
    console.log(responseBody.result.items);
  });
  // TODO: create, update and delete
  // TODO: refresh token flow
  // -- end of admin cases
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
