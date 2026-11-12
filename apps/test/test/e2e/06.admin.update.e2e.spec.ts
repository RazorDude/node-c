/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import { TestCourse } from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - update', () => {
  let adminAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
  });
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the items that didn't match the filters must remain the same
    const unchangedPreItems: TestCourse[] = [];
    const unchangedPostItems: (TestCourse | undefined)[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        unchangedPreItems.push(item);
        unchangedPostItems.push(postItemsById.get(item.id));
      }
    }
    expect(unchangedPostItems).toEqual(unchangedPreItems);
    for (const expectedItem of expectedItems) {
      const [id, preItem] = expectedItem;
      const postItem = postItemsById.get(id) as TestCourse;
      expect(postItem.name).toEqual('Test update course - array of filters');
      expect(postItem.categoryId).toEqual(preItem.categoryId);
      expect(postItem.courseTypeId).toEqual(preItem.courseTypeId);
      expect(postItem.createdAt).toEqual(preItem.createdAt);
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the items that didn't match the filters must remain the same
    const unchangedPreItems: TestCourse[] = [];
    const unchangedPostItems: (TestCourse | undefined)[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        unchangedPreItems.push(item);
        unchangedPostItems.push(postItemsById.get(item.id));
      }
    }
    expect(unchangedPostItems).toEqual(unchangedPreItems);
    for (const expectedItem of expectedItems) {
      const [id, preItem] = expectedItem;
      const postItem = postItemsById.get(id) as TestCourse;
      expect(postItem.categoryId).toEqual(1);
      expect(postItem.courseTypeId).toEqual(preItem.courseTypeId);
      expect(postItem.name).toEqual(preItem.name);
      expect(postItem.createdAt).toEqual(preItem.createdAt);
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the items that didn't match the filters must remain the same
    const unchangedPreItems: TestCourse[] = [];
    const unchangedPostItems: (TestCourse | undefined)[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        unchangedPreItems.push(item);
        unchangedPostItems.push(postItemsById.get(item.id));
      }
    }
    expect(unchangedPostItems).toEqual(unchangedPreItems);
    for (const expectedItem of expectedItems) {
      const [id, preItem] = expectedItem;
      const postItem = postItemsById.get(id) as TestCourse;
      expect(postItem.categoryId).toEqual(1);
      expect(postItem.courseTypeId).toEqual(preItem.courseTypeId);
      expect(postItem.name).toEqual(preItem.name);
      expect(postItem.createdAt).toEqual(preItem.createdAt);
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the items that didn't match the filters must remain the same
    const unchangedPreItems: TestCourse[] = [];
    const unchangedPostItems: (TestCourse | undefined)[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        unchangedPreItems.push(item);
        unchangedPostItems.push(postItemsById.get(item.id));
      }
    }
    expect(unchangedPostItems).toEqual(unchangedPreItems);
    for (const expectedItem of expectedItems) {
      const [id, preItem] = expectedItem;
      const postItem = postItemsById.get(id) as TestCourse;
      expect(postItem.categoryId).toEqual(1);
      expect(postItem.courseTypeId).toEqual(preItem.courseTypeId);
      expect(postItem.name).toEqual(preItem.name);
      expect(postItem.createdAt).toEqual(preItem.createdAt);
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the items that didn't match the filters must remain the same
    const unchangedPreItems: TestCourse[] = [];
    const unchangedPostItems: (TestCourse | undefined)[] = [];
    for (const i in preItems) {
      const item = preItems[i];
      if (!expectedItems.has(item.id)) {
        unchangedPreItems.push(item);
        unchangedPostItems.push(postItemsById.get(item.id));
      }
    }
    expect(unchangedPostItems).toEqual(unchangedPreItems);
    for (const expectedItem of expectedItems) {
      const [id, preItem] = expectedItem;
      const postItem = postItemsById.get(id) as TestCourse;
      expect(postItem.categoryId).toEqual(1);
      expect(postItem.courseTypeId).toEqual(preItem.courseTypeId);
      expect(postItem.name).toEqual(preItem.name);
      expect(postItem.createdAt).toEqual(preItem.createdAt);
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
    const postItemsById = new Map<number, TestCourse>();
    for (const i in postItems) {
      postItemsById.set(postItems[i].id, postItems[i]);
    }
    // the cache items have no timestamps, so the updated item is checked by its fields only
    const updatedPostItem = postItemsById.get(courseToUpdate.id) as TestCourse;
    expect(updatedPostItem.name).toEqual(newName);
    expect(updatedPostItem.categoryId).toEqual(courseToUpdate.categoryId);
    expect(updatedPostItem.courseTypeId).toEqual(courseToUpdate.courseTypeId);
    postItemsById.delete(courseToUpdate.id);
    preItemsById.delete(courseToUpdate.id);
    expect(postItemsById).toEqual(preItemsById);
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
});
