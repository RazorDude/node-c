/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */
/** biome-ignore-all lint/style/noMagicNumbers: Test file. */
/** biome-ignore-all lint/suspicious/noConsole: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import { TestUserLoginLog } from './common/e2e.common.definitions.js';
import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_SSO,
  findUserByEmail,
  loginUser
} from './common/e2e.common.js';

describe('NodeC.Apps.Test.CoursePlatformDelegated - user 0 - login and find with mutation of input data', () => {
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
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: more error cases for authorization points
  // TODO: more success cases for authorization points
  // TODO: more mutation of input data
  // TODO: mutation of output data
});
