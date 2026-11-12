/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - bulkCreate', () => {
  let adminAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
  });
  // bulk create courses in the DB
  it('should bulk create courses in the DB', async () => {
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
    const benchmarkOldId = dataPreBulkCreateBody.result.items[0].id + 2;
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
      dataPreBulkCreateBody.result.items.length + 6
    );
  });
  // throw an error for a duplicate in one of the items - no items should be created
  it('should throw an error for a duplicate in one of the items - no items should be created', async () => {
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
  });
  // throw an error for a missing field in one of the items - no items should be created
  it('should throw an error for a missing field in one of the items - no items should be created', async () => {
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
  });
  // bulk create courses in the cache
  it('should bulk create courses in the cache', async () => {
    const dataPreBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
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
    expect(responseBody.result[0].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id + 1
    );
    expect(responseBody.result[0].courseTypeId).toEqual(1);
    expect(responseBody.result[0].name).toEqual('Test bulk create course');
    expect(responseBody.result[1].id).toEqual(
      dataPreBulkCreateBody.result.items[0].id + 2
    );
    expect(responseBody.result[1].courseTypeId).toEqual(2);
    expect(responseBody.result[1].name).toEqual('Test bulk create course 2');
    const dataPostBulkCreate = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
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
      dataPreBulkCreateBody.result.items.length + 2
    );
  });
  // TODO: bulk create courses in the DB, then the cache using the input data - when the relevant functionality is implemented in the DomainEntityService
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)
  it("should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly not being provided (it's true by default)", async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    // it's +3 here, instead of +1, due to the errors being thrown in the previous tests increasing the auto-increment
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 3;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
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
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length
    );
  });
  // bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true
  it('should bulk create courses in the DB and NOT in the cache due to runOnNoFirstServiceResultOnly being provided as true', async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 1;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
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
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length
    );
  });
  // bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false
  it('should bulk create courses in the DB and the cache using the first service (DB) data due to runOnNoFirstServiceResultOnly being set to false', async () => {
    const dataPreBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateDBBody = await dataPreBulkCreateDB.json();
    const benchmarkOldIdDB = dataPreBulkCreateDBBody.result.items[0].id + 1;
    const dataPreBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreBulkCreateCacheBody = await dataPreBulkCreateCache.json();
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
      expect(responseBody.result[i].id).toEqual(
        responseBody.resultsByService.cache[i].id
      );
      expect(responseBody.result[i].courseTypeId).toEqual(i % 2 === 0 ? 1 : 2);
      expect(responseBody.result[i].courseTypeId).toEqual(
        responseBody.resultsByService.cache[i].courseTypeId
      );
      expect(responseBody.result[i].name).toEqual(
        responseBody.resultsByService.cache[i].name
      );
    }
    const dataPostBulkCreateDB = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateDBBody = await dataPostBulkCreateDB.json();
    expect(dataPostBulkCreateDBBody.result.items.length).toEqual(
      dataPreBulkCreateDBBody.result.items.length + 2
    );
    const dataPostBulkCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostBulkCreateCacheBody = await dataPostBulkCreateCache.json();
    expect(dataPostBulkCreateCacheBody.result.items.length).toEqual(
      dataPreBulkCreateCacheBody.result.items.length + 2
    );
  });
});
