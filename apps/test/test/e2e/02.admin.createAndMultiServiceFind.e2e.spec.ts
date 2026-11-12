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

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - create and multi-service find', () => {
  let adminAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
  });
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
});
