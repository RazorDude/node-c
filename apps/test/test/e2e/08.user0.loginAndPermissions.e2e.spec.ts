/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  TestCourse,
  TestUserLoginLog
} from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_SSO,
  findUserByEmail,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - user 0 - login and full range of permissions tests', () => {
  let adminAccessToken = '';
  let adminUserId = 0;
  let user0AccessToken = '';
  let user0Id = 0;
  let user0LoginLogs: TestUserLoginLog[] = [];
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
    adminUserId = (await findUserByEmail(adminAccessToken, 'admin@node-c.com'))
      .id;
  });
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
    user0Id = (await findUserByEmail(adminAccessToken, 'user0@node-c.com')).id;
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
  // find courses as user 0 (no options) - only the assigned courses are returned
  it('should find courses as user 0 (no options) - only the assigned courses are returned', async () => {
    // without a courseTypeId filter, the free courses authorization point doesn't apply, so the non-free courses one
    // adds the ids of the courses assigned to user 0 (courses 1 and 4 in the seed) to the filters
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[id][]=1&filters[id][]=4`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual(adminResponseBody.result);
  });
  // find free courses as user 0 (pagination, page 1)
  it('should find free courses as user 0 (pagination, page 1)', async () => {
    // the courseTypeId filter for free courses is the required static data of the free courses authorization point
    const query = 'filters[courseTypeId]=1&page=1&perPage=1';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(1);
    expect(responseBody.result.perPage).toEqual(1);
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
  });
  // find free courses as user 0 (pagination, page 2)
  it('should find free courses as user 0 (pagination, page 2)', async () => {
    const query = 'filters[courseTypeId]=1&page=2&perPage=1';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.page).toEqual(2);
    expect(responseBody.result.perPage).toEqual(1);
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
  });
  // find free courses as user 0 (sorting)
  it('should find free courses as user 0 (sorting)', async () => {
    const query = 'filters[courseTypeId]=1&orderBy[id]=desc';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
    const items: TestCourse[] = responseBody.result.items;
    for (let i = 1; i < items.length; i++) {
      expect(items[i].id < items[i - 1].id).toEqual(true);
    }
  });
  // find all free courses as user 0 (no sorting and pagination)
  it('should find all free courses as user 0 (no sorting and pagination)', async () => {
    const query = 'filters[courseTypeId]=1&findAll=true';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
    const items: TestCourse[] = responseBody.result.items;
    for (const i in items) {
      expect(items[i].courseTypeId).toEqual(1);
    }
  });
  // throw a forbidden error when user 0 tries to find a non-free course that is not assigned to them
  it('should throw a forbidden error when user 0 tries to find a non-free course that is not assigned to them', async () => {
    // course 3 is not free (courseTypeId 2), so the free courses authorization point doesn't apply, and it's not
    // assigned to user 0, so the non-free courses authorization point denies access
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[id]=3`,
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
  // throw a forbidden error when user 0 tries to find one non-free course that is not assigned to them
  it('should throw a forbidden error when user 0 tries to find one non-free course that is not assigned to them', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/3`,
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
  // throw a forbidden error when user 0 tries to access a controller that none of their authorization points cover
  it('should throw a forbidden error when user 0 tries to access a controller that none of their authorization points cover', async () => {
    const response = await fetch(`${BASE_URL_COURSE_PLATFORM_DELEGATED}/users`, {
      headers: {
        authorization: `Bearer ${user0AccessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    });
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // throw a forbidden error when user 0 tries to call a handler that none of their authorization points cover
  it('should throw a forbidden error when user 0 tries to call a handler that none of their authorization points cover', async () => {
    // the courses authorization points of user 0 only cover find and findOne
    const name = 'Test create course - forbidden for user 0';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        body: JSON.stringify({
          data: { courseTypeId: 1, name }
        }),
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&filters[name]=${encodeURIComponent(name)}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(adminResponseBody.result.items).toHaveLength(0);
  });
  // find only the assigned courses as user 0 when the required static data for free courses doesn't match
  it("should find only the assigned courses as user 0 when the required static data for free courses doesn't match", async () => {
    // courseTypeId 2 fails the required static data of the free courses authorization point, so the next one (non-free
    // courses) applies and adds the ids of the courses assigned to user 0 (courses 1 and 4 in the seed) to the filters
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=2`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=2&filters[id][]=1&filters[id][]=4`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual(adminResponseBody.result);
  });
  // find only the assigned courses as user 0 when an array of course ids, including non-assigned ones, is provided
  it('should find only the assigned courses as user 0 when an array of course ids, including non-assigned ones, is provided', async () => {
    // the non-free courses authorization point narrows the array down to the courses assigned to user 0 - course 4,
    // since course 3 isn't assigned to user 0
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[id][]=4&filters[id][]=3`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[id][]=4`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual(adminResponseBody.result);
  });
  // find one free course as user 0
  it('should find one free course as user 0', async () => {
    // course 2 is free, so the findOne free course authorization point grants access with the courseTypeId filter
    const path = '/courses/item/2?filters[courseTypeId]=1';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual(adminResponseBody.result);
  });
  // find free courses as user 0 with a non-allowed relation removed from the included relations
  it('should find free courses as user 0 with a non-allowed relation removed from the included relations', async () => {
    // the authorization points only allow lessons, lessons.lessonType and courseType in the included relations,
    // so category is removed from the input data before it reaches the controller
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1&include[]=lessons&include[]=category`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1&include[]=lessons`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
    const items: TestCourse[] = responseBody.result.items;
    for (const i in items) {
      expect(items[i]).toHaveProperty('lessons');
      expect(items[i]).not.toHaveProperty('category');
    }
  });
  // find free courses as user 0 with the included relations removed when none of them are allowed
  it('should find free courses as user 0 with the included relations removed when none of them are allowed', async () => {
    // category is not in the allowed included relations, so the whole include is removed from the input data
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1&include[]=category`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
    const items: TestCourse[] = responseBody.result.items;
    for (const i in items) {
      expect(items[i]).not.toHaveProperty('category');
    }
  });
  // find free courses as user 0 with the included relations matched against the allowed relation patterns
  it('should find free courses as user 0 with the included relations matched against the allowed relation patterns', async () => {
    // lessons.lessonType matches the /lessons(\.lessonType)?/ pattern of the allowed included relations, while
    // lessons.courses doesn't, so it's removed from the input data
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1&` +
        'include[]=lessons.lessonType&include[]=lessons.courses',
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1&include[]=lessons.lessonType`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    // the free courses authorization point removes the deletedAt field from the output - it's null for the found courses
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    const expectedItems: TestCourse[] = [];
    for (const i in adminItems) {
      const { deletedAt: _deletedAt, ...item } = adminItems[i];
      expectedItems.push(item);
    }
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      items: expectedItems
    });
    const items: (TestCourse & {
      lessons: { courses?: unknown; lessonType?: unknown }[];
    })[] = responseBody.result.items;
    for (const i in items) {
      const { lessons } = items[i];
      for (const j in lessons) {
        expect(lessons[j]).toHaveProperty('lessonType');
        expect(lessons[j]).not.toHaveProperty('courses');
      }
    }
  });
  // find one free course as user 0 with a forbidden field of an included relation removed from the output data
  it('should find one free course as user 0 with a forbidden field of an included relation removed from the output data', async () => {
    // the findOne free course authorization point forbids courseType.createdAt values that match /[0-9]/,
    // so the datetime is removed from the included courseType
    const path = '/courses/item/2?filters[courseTypeId]=1&include[]=courseType';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result).toHaveProperty('courseType');
    expect(responseBody.result.courseType).not.toHaveProperty('createdAt');
    // the admin's output is not mutated
    expect(adminResponseBody.result.courseType).toHaveProperty('createdAt');
    const { createdAt: _createdAt, ...expectedCourseType } =
      adminResponseBody.result.courseType;
    expect(responseBody.result).toEqual({
      ...adminResponseBody.result,
      courseType: expectedCourseType
    });
  });
  // find free courses as user 0 with the output data mutated by the authorization point
  it('should find free courses as user 0 with the output data mutated by the authorization point', async () => {
    // the free courses authorization point only allows createdAt and deletedAt values that match /[0-9-.:TZ]/ -
    // createdAt is a datetime, so it's kept, while deletedAt is null for the found courses, so it's removed
    const query = 'filters[courseTypeId]=1&findAll=true';
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?${query}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    const items: TestCourse[] = responseBody.result.items;
    const adminItems: TestCourse[] = adminResponseBody.result.items;
    expect(items.length).toBeGreaterThan(0);
    expect(items).toHaveLength(adminItems.length);
    for (const i in items) {
      expect(items[i]).toHaveProperty('createdAt');
      expect(items[i]).not.toHaveProperty('deletedAt');
    }
    // the admin's output is not mutated
    for (const i in adminItems) {
      expect(adminItems[i]).toHaveProperty('createdAt');
      expect(adminItems[i]).toHaveProperty('deletedAt');
      expect(adminItems[i].deletedAt).toBeNull();
    }
  });
  // find one non-free course assigned to user 0
  it('should find one non-free course assigned to user 0', async () => {
    // there's no courseTypeId filter, so the findOne free course authorization point doesn't apply, while the
    // findOne non-free course one grants access, since course 4 is one of the courses assigned to user 0
    const courseId = 4;
    const path = `/courses/item/${courseId}`;
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
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
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const adminResponseBody = await adminResponse.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.id).toEqual(courseId);
    expect(responseBody.result).toEqual(adminResponseBody.result);
  });
});
