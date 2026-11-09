/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/suspicious/noSkippedTests: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - single-service findOne', () => {
  let adminAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
  });
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
});
