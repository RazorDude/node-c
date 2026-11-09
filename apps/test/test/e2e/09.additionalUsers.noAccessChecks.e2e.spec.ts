/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import { TestCourse } from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - additional users - no access checks', () => {
  let adminAccessToken = '';
  let user1AccessToken = '';
  let user3AccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
    user1AccessToken = await loginUser('user1@node-c.com', 'User1Password');
    user3AccessToken = await loginUser('user3@node-c.com', 'User3Password');
  });
  // ----
  // -- start of user 3 cases - no access to the module
  // ----
  // throw a forbidden error when user 3 tries to find courses, since their only permission is for a different module
  it('should throw a forbidden error when user 3 tries to find courses, since their only permission is for a different module', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=1`,
      {
        headers: {
          authorization: `Bearer ${user3AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // ----
  // -- end of user 3 cases
  // ----

  // ###########################################################################################

  // ----
  // -- start of user 1 cases - missing user field data
  // ----
  // throw a forbidden error when user 1 tries to find a non-free course, since they have no assigned courses
  it('should throw a forbidden error when user 1 tries to find a non-free course, since they have no assigned courses', async () => {
    // there's no courseTypeId filter, so the free courses permission doesn't apply, while the non-free courses
    // one has no assigned courses of user 1 to compare the course id against
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[id]=1`,
      {
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // throw a forbidden error when user 1 tries to find one non-free course, since they have no assigned courses
  it('should throw a forbidden error when user 1 tries to find one non-free course, since they have no assigned courses', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/1`,
      {
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // throw a forbidden error when user 1 tries to find courses without filters, since they have no assigned courses
  it('should throw a forbidden error when user 1 tries to find courses without filters, since they have no assigned courses', async () => {
    // if the missing assigned courses were loaded as an empty array instead, the non-free courses permission would
    // set the id filter to [], which the query builder skips, so all of the courses would be returned with a 200
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses`,
      {
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('result');
  });
  // find premium courses as user 1 with the forbidden included relations removed from the input data
  it('should find premium courses as user 1 with the forbidden included relations removed from the input data', async () => {
    // courseTypeId 3 fails the free courses permission and course 4 isn't assigned to user 1, so the non-free courses
    // one fails too - the premium courses permission applies, and since category matches its forbidden input data,
    // the whole include field is removed (courseType included)
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=3&filters[id]=4&` +
        'include[]=courseType&include[]=category',
      {
        headers: {
          authorization: `Bearer ${user1AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    const adminResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?filters[courseTypeId]=3&filters[id]=4`,
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
    const items: TestCourse[] = responseBody.result.items;
    for (const i in items) {
      expect(items[i]).not.toHaveProperty('category');
      expect(items[i]).not.toHaveProperty('courseType');
    }
  });
  // ----
  // -- end of user 1 cases
  // ----
});
