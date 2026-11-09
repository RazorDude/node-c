/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  TestCourse,
  TestUserLoginLog
} from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  findAllUserLoginLogs,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - delete', () => {
  let adminAccessToken = '';
  let adminLoginLogs: TestUserLoginLog[] = [];
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
    adminLoginLogs = await findAllUserLoginLogs(adminAccessToken);
  });
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
});
