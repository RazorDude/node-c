/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { describe, expect, it } from 'vitest';

import { BASE_URL_SSO } from './common/e2e.common.js';

// Course Platform (Delegated) only;
// TODO: allowed relations fields parsing
// TODO: redis - array-based and object-based storage with interal primary keys, hashmap methods
// TODO: refresh token flow
// TODO: oauth2 auth, okta auth
// TODO: sentinel and cluster suites
// TODO: valkey - full suites (same as redis)
// TODO: other apps' suites
describe('NodeC.Apps.Test.CoursePlatformDelegated - general checks', () => {
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch(BASE_URL_SSO);
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  it('should return an error with status 401 when calling non-implemented routes', async () => {
    const response = await fetch(`${BASE_URL_SSO}/tokens`);
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });
  // TODO: make sure query params are ignored in the originalUrl
  // throw a bad request error when trying to issue an access token without the auth field (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token without the auth field (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain(
      'auth should not be null or undefined'
    );
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // throw a bad request error when trying to issue an access token with an empty email filter (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token with an empty email filter (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' },
        filters: { email: '' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('filters.email should not be empty');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // throw a bad request error when trying to issue an access token with a non-string password (invalid body vs dto)
  it('should throw a bad request error when trying to issue an access token with a non-string password (invalid body vs dto)', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 12_345 },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('auth.password must be a string');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an email that doesn't exist
  it("should fail to issue an access token for an email that doesn't exist", async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' },
        filters: { email: 'nobody@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email with a wrong password
  it('should fail to issue an access token for an existing email with a wrong password', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'WrongPassword' },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email with another user's password
  it("should fail to issue an access token for an existing email with another user's password", async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'User0Password' },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token for an existing email without a password
  it('should fail to issue an access token for an existing email without a password', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: {},
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to issue an access token without an email filter
  it('should fail to issue an access token without an email filter', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
      body: JSON.stringify({
        auth: { password: 'AdminPassword' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(400);
    expect(responseBody).toHaveProperty('statusCode');
    expect(responseBody.statusCode).toEqual(400);
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
});
