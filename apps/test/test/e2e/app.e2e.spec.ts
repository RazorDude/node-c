import { HttpMethod } from '@node-c/core';
import { describe, expect, it } from 'vitest';

describe('NodeC.Apps.Test', () => {
  let adminAccessToken = '';
  // -- start of general checks
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch('http://localhost:2081');
    expect(response.status).toEqual(401);
  });
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-implemented routes', async () => {
    const response = await fetch('http://localhost:2081/tokens');
    expect(response.status).toEqual(401);
  });
  // TODO: make sure query params are ignored in originalUrl
  // TODO: issue an access token - bad request on invalid body vs dto
  // TODO: issue an access token - invalid email & password (all cases)
  // -- end of general checks
  // -- start of admin cases
  // log in as admin
  it('log the admin user in successfully', async () => {
    const response = await fetch('http://localhost:2081/users/accessToken', {
      body: JSON.stringify({
        auth: {
          password: 'AdminPassword',
          type: 'local'
        },
        filters: { email: 'admin@node-c.com' }
      }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    const responseBody = await response.json();
    expect(response.status).toEqual(201);
    expect(responseBody).toHaveProperty('accessToken');
    adminAccessToken = responseBody.accessToken;
  });
  // TODO: non-enabled default routes
  // TODO: check endpointSecurityMode: undefined vs Strict vs Lax
  // TODO: find users (no options)
  // TODO: find users (pagination, page 1 and 2)
  // TODO: find users (sorting)
  // TODO: find users (no sorting and pagination)
  // -- end of admin cases
  // -- start of user 0 cases
  // TODO: log in as user 0
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: error cases for authorization points
  // -- end of user 0 cases
});
