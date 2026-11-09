/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - admin - multi-service findOne', () => {
  let adminAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
  });
  // find a course in the db that does not exist in the cache, by id - when the first service is the cache
  it('should find a course in the db that does not exist in the cache, by id - when the first service is the cache', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=cache&dataServices[]=main`,
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
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main.id).toEqual(11);
  });
  // not find a course in the cache, look for it in the DB, find it and create it in the cache using the DB data
  it('should not find a course in the cache, look for it in the DB, find it and create it in the cache using the DB data', async () => {
    const dataPreCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPreCreateCacheBody = await dataPreCreateCache.json();
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=cache&dataServices[]=main&` +
        'saveAdditionalResultsInFirstService[serviceName]=main&',
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
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('main');
    expect(responseBody.resultsByService.main.id).toEqual(11);
    const dataPostCreateCache = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses?findAll=true&orderBy[id]=desc&dataServices[]=cache`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const dataPostCreateCacheBody = await dataPostCreateCache.json();
    expect(dataPostCreateCacheBody.result.items.length).toEqual(
      dataPreCreateCacheBody.result.items.length + 1
    );
    expect(
      (dataPostCreateCacheBody.result.items as { id: number }[]).find(
        (item) => item.id === 11
      )?.id
    ).toEqual(11);
  });
  // find a course in the DB and retrieve its data from the cache
  it('should find a course in the DB and retrieve its data from the cache', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}/courses/item/11?dataServices[]=main&dataServices[]=cache&` +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=false&',
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
    expect(responseBody.result.id).toEqual(11);
    expect(responseBody).toHaveProperty('resultsByService');
    expect(responseBody.resultsByService).toHaveProperty('cache');
    expect(responseBody.resultsByService.cache.id).toEqual(11);
  });
});
