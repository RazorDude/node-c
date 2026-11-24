/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_COURSE_PLATFORM_FEDERATED,
  loginUser,
  requestCourses
} from './common/e2e.common.js';

// The federated API logs users in through the SSO app and uses the SSO app's tokens as its own. These tests cover
// its login and check that it returns the same results as the delegated API - the data and domain behaviour itself
// is covered by the earlier files.
describe('NodeC.Apps.Test.CoursePlatformFederated - login and parity with the delegated API', () => {
  let adminAccessToken = '';
  let adminFederatedAccessToken = '';
  let createdCourseId = 0;
  let user0AccessToken = '';
  let user0FederatedAccessToken = '';
  beforeAll(async () => {
    adminAccessToken = await loginUser('admin@node-c.com', 'AdminPassword');
    user0AccessToken = await loginUser('user0@node-c.com', 'User0Password');
  });
  // log the admin user in through the federated API
  it('should log the admin user in through the federated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/users/auth/userLocal`,
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
    adminFederatedAccessToken = responseBody.accessToken;
  });
  // log user 0 in through the federated API
  it('should log user 0 in through the federated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/users/auth/userLocal`,
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
    user0FederatedAccessToken = responseBody.accessToken;
  });
  // throw a bad request error when logging in through the federated API without the auth field (invalid body vs dto)
  it('should throw a bad request error when logging in through the federated API without the auth field (invalid body vs dto)', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/users/auth/userLocal`,
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
  // fail to log in through the federated API with a wrong password - the SSO app rejects it
  it('should fail to log in through the federated API with a wrong password', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/users/auth/userLocal`,
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
  // fail to log in through the federated API with an email that doesn't exist - the SSO app rejects it
  it("should fail to log in through the federated API with an email that doesn't exist", async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/users/auth/userLocal`,
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
  // return an empty 401 when calling a non-anonymous route of the federated API without an access token
  it('should return an error with status 401 when calling the federated API without an access token', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/courses`
    );
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  // find all courses as the admin user - the same as in the delegated API
  it('should find all courses as the admin user, the same as the delegated API', async () => {
    const query = '?findAll=true&orderBy[id]=asc';
    const federatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_FEDERATED,
      adminFederatedAccessToken,
      query
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      query
    );
    expect(federatedResponse.status).toEqual(HttpStatus.OK);
    expect(federatedResponse.body).toHaveProperty('result');
    expect(federatedResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // find one course as the admin user - the same as in the delegated API
  it('should find one course as the admin user, the same as the delegated API', async () => {
    // course 2 isn't deleted by the earlier files
    const federatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_FEDERATED,
      adminFederatedAccessToken,
      '/item/2'
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      '/item/2'
    );
    expect(federatedResponse.status).toEqual(HttpStatus.OK);
    expect(federatedResponse.body).toHaveProperty('result');
    expect(federatedResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // find courses as user 0 - only the assigned ones, the same as in the delegated API
  it('should find only the assigned courses as user 0, the same as the delegated API', async () => {
    const federatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_FEDERATED,
      user0FederatedAccessToken,
      ''
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0AccessToken,
      ''
    );
    expect(federatedResponse.status).toEqual(HttpStatus.OK);
    expect(federatedResponse.body).toHaveProperty('result');
    expect(federatedResponse.body.result).toEqual(
      delegatedResponse.body.result
    );
  });
  // throw a forbidden error when user 0 tries to find a non-free course that isn't assigned to them, the same as in the delegated API
  it("should throw a forbidden error when user 0 tries to find a course that isn't assigned to them, the same as the delegated API", async () => {
    // course 3 isn't free and isn't assigned to user 0
    const federatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_FEDERATED,
      user0FederatedAccessToken,
      '?filters[id]=3'
    );
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0AccessToken,
      '?filters[id]=3'
    );
    expect(federatedResponse.status).toEqual(HttpStatus.FORBIDDEN);
    expect(federatedResponse.body).not.toHaveProperty('result');
    expect(delegatedResponse.status).toEqual(HttpStatus.FORBIDDEN);
  });
  // create a course through the federated API - it's visible in the delegated API
  it('should create a course through the federated API, visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/courses`,
      {
        body: JSON.stringify({
          data: { courseTypeId: 1, name: 'Test federated course' }
        }),
        headers: {
          authorization: `Bearer ${adminFederatedAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.POST
      }
    );
    expect(response.status).toEqual(HttpStatus.CREATED);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('result');
    expect(responseBody.result.courseTypeId).toEqual(1);
    expect(responseBody.result.name).toEqual('Test federated course');
    createdCourseId = responseBody.result.id;
    const delegatedResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      adminAccessToken,
      `/item/${createdCourseId}`
    );
    expect(delegatedResponse.status).toEqual(HttpStatus.OK);
    expect(delegatedResponse.body.result.id).toEqual(createdCourseId);
    expect(delegatedResponse.body.result.courseTypeId).toEqual(1);
    expect(delegatedResponse.body.result.name).toEqual('Test federated course');
  });
  // update the created course through the federated API - the change is visible in the delegated API
  it('should update a course through the federated API, visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/courses`,
      {
        body: JSON.stringify({
          data: { name: 'Test federated course updated' },
          filters: { id: createdCourseId }
        }),
        headers: {
          authorization: `Bearer ${adminFederatedAccessToken}`,
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
      'Test federated course updated'
    );
  });
  // delete the created course through the federated API - it's no longer visible in the delegated API
  it('should delete a course through the federated API, no longer visible in the delegated API', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM_FEDERATED}/courses`,
      {
        body: JSON.stringify({
          filters: { id: createdCourseId }
        }),
        headers: {
          authorization: `Bearer ${adminFederatedAccessToken}`,
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
