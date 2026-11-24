/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_COURSE_PLATFORM_STANDALONE,
  loginUser,
  requestCourses
} from './common/e2e.common.js';

// The standalone API logs users in itself, against the same users as the SSO app, and signs its own tokens with its
// own secrets. These tests cover its login and check that it returns the same results as the delegated API - the data
// and domain behaviour itself is covered by the earlier files.
describe('NodeC.Apps.Test.CoursePlatformStandalone - login and parity with the delegated API', () => {
  let adminAccessToken = '';
  let adminStandaloneAccessToken = '';
  let createdCourseId = 0;
  let user0AccessToken = '';
  let user0StandaloneAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
    user0AccessToken = await loginUser('user0@node-c.com', 'User0Password');
  });
  // log the admin user in through the standalone API
  it('should log the admin user in through the standalone API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/users/auth/userLocal`,
      {
        body: JSON.stringify({
          auth: { password: 'AdminPassword' },
          filters: { email: 'admin@node-c.com' }
        }),
        headers: { 'content-type': 'application/json' },
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    adminStandaloneAccessToken = responseBody.accessToken;
  });
  // log user 0 in through the standalone API
  it('should log user 0 in through the standalone API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/users/auth/userLocal`,
      {
        body: JSON.stringify({
          auth: { password: 'User0Password' },
          filters: { email: 'user0@node-c.com' }
        }),
        headers: { 'content-type': 'application/json' },
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    user0StandaloneAccessToken = responseBody.accessToken;
  });
  // throw a bad request error when logging in through the standalone API without the auth field (invalid body vs dto)
  it('should throw a bad request error when logging in through the standalone API without the auth field (invalid body vs dto)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/users/auth/userLocal`,
      {
        body: JSON.stringify({
          filters: { email: 'admin@node-c.com' }
        }),
        headers: { 'content-type': 'application/json' },
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain(
      'auth should not be null or undefined'
    );
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to log in through the standalone API with a wrong password
  it('should fail to log in through the standalone API with a wrong password', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/users/auth/userLocal`,
      {
        body: JSON.stringify({
          auth: { password: 'WrongPassword' },
          filters: { email: 'admin@node-c.com' }
        }),
        headers: { 'content-type': 'application/json' },
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to log in through the standalone API with an email that doesn't exist
  it("should fail to log in through the standalone API with an email that doesn't exist", async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/users/auth/userLocal`,
      {
        body: JSON.stringify({
          auth: { password: 'AdminPassword' },
          filters: { email: 'nobody@node-c.com' }
        }),
        headers: { 'content-type': 'application/json' },
        method: HttpMethod.POST
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // return an empty 401 when calling a non-anonymous route of the standalone API without an access token
  it('should return an error with status 401 when calling the standalone API without an access token', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/courses`
    );
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  // return an empty 401 when calling the standalone API with a token issued by the SSO app - it uses its own secrets
  it('should return an error with status 401 when calling the standalone API with an access token issued by the SSO app', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/courses`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  // find all courses as the admin user - the same as in the delegated API
  it('should find all courses as the admin user, the same as the delegated API', async () => {
    const query = '?findAll=true&orderBy[id]=asc';
    const standaloneResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_STANDALONE,
      adminStandaloneAccessToken,
      query
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      query
    );
    expect(standaloneResponse.status).toEqual(HttpStatus.OK);
    expect(standaloneResponse.body).toHaveProperty('result');
    expect(standaloneResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // find one course as the admin user - the same as in the delegated API
  it('should find one course as the admin user, the same as the delegated API', async () => {
    // course 2 isn't deleted by the earlier files
    const standaloneResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_STANDALONE,
      adminStandaloneAccessToken,
      '/item/2'
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      '/item/2'
    );
    expect(standaloneResponse.status).toEqual(HttpStatus.OK);
    expect(standaloneResponse.body).toHaveProperty('result');
    expect(standaloneResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // find courses as user 0 - only the assigned ones, the same as in the delegated API
  it('should find only the assigned courses as user 0, the same as the delegated API', async () => {
    const standaloneResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_STANDALONE,
      user0StandaloneAccessToken,
      ''
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0AccessToken,
      ''
    );
    expect(standaloneResponse.status).toEqual(HttpStatus.OK);
    expect(standaloneResponse.body).toHaveProperty('result');
    expect(standaloneResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // throw a forbidden error when user 0 tries to find a course that isn't assigned to them, the same as in the delegated API
  it("should throw a forbidden error when user 0 tries to find a course that isn't assigned to them, the same as the delegated API", async () => {
    // course 3 isn't free and isn't assigned to user 0
    const standaloneResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_STANDALONE,
      user0StandaloneAccessToken,
      '?filters[id]=3'
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0AccessToken,
      '?filters[id]=3'
    );
    expect(standaloneResponse.status).toEqual(HttpStatus.FORBIDDEN);
    expect(standaloneResponse.body).not.toHaveProperty('result');
    expect(delegatedResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });
  // find the login logs of user 0 - the same as in the delegated API
  it('should find only the login logs of user 0, the same as the delegated API', async () => {
    const path = '/userLoginLogs?findAll=true&orderBy[datetime]=asc';
    const standaloneResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}${path}`,
      {
        headers: {
          authorization: `Bearer ${user0StandaloneAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const delegatedResponse = await fetch(
      `${BASE_URL_COURSE_PLATFORM_DELEGATED}${path}`,
      {
        headers: {
          authorization: `Bearer ${user0AccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    expect(standaloneResponse.status).toEqual(HttpStatus.OK);
    const standaloneResponseBody = await standaloneResponse.json();
    const delegatedResponseBody = await delegatedResponse.json();
    expect(standaloneResponseBody).toHaveProperty('result');
    expect(standaloneResponseBody.result).toEqual(delegatedResponseBody.result);
  });
  // create a course through the standalone API - it's visible in the delegated API
  it('should create a course through the standalone API, visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/courses`,
      {
        body: JSON.stringify({
          data: { courseTypeId: 1, name: 'Test standalone course' }
        }),
        headers: {
          authorization: `Bearer ${adminStandaloneAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(HttpStatus.CREATED);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.courseTypeId).toEqual(1);
    expect(responseBody.result.name).toEqual('Test standalone course');
    createdCourseId = responseBody.result.id;
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      `/item/${createdCourseId}`
    );
    expect(delegatedResponse.status).toEqual(HttpStatus.OK);
    expect(delegatedResponse.body.result.id).toEqual(createdCourseId);
    expect(delegatedResponse.body.result.courseTypeId).toEqual(1);
    expect(delegatedResponse.body.result.name).toEqual(
      'Test standalone course'
    );
  });
  // update the created course through the standalone API - the change is visible in the delegated API
  it('should update a course through the standalone API, visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/courses`,
      {
        body: JSON.stringify({
          data: { name: 'Test standalone course updated' },
          filters: { id: createdCourseId }
        }),
        headers: {
          authorization: `Bearer ${adminStandaloneAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.PATCH.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.count).toEqual(1);
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      `/item/${createdCourseId}`
    );
    expect(delegatedResponse.status).toEqual(HttpStatus.OK);
    expect(delegatedResponse.body.result.id).toEqual(createdCourseId);
    expect(delegatedResponse.body.result.courseTypeId).toEqual(1);
    expect(delegatedResponse.body.result.name).toEqual(
      'Test standalone course updated'
    );
  });
  // delete the created course through the standalone API - it's no longer visible in the delegated API
  it('should delete a course through the standalone API, no longer visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_STANDALONE}/courses`,
      {
        body: JSON.stringify({
          filters: { id: createdCourseId }
        }),
        headers: {
          authorization: `Bearer ${adminStandaloneAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.DELETE.toUpperCase()
      }
    );
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.count).toEqual(1);
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      `?filters[id]=${createdCourseId}`
    );
    expect(delegatedResponse.status).toEqual(HttpStatus.OK);
    expect(delegatedResponse.body.result.items).toEqual([]);
  });
});
