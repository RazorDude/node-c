import { HttpMethod } from '@node-c/core';
import { describe, expect, it } from 'vitest';

const BASE_URL_COURSE_PLATFORM = 'http://localhost:2071';
const BASE_URL_SSO = 'http://localhost:2081';

describe('NodeC.Apps.Test', () => {
  let adminAccessToken = '';
  // -- start of general checks
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch(BASE_URL_SSO);
    expect(response.status).toEqual(401);
  });
  it('should return an error with status 401 when calling non-implemented routes', async () => {
    const response = await fetch(`${BASE_URL_SSO}/tokens`);
    expect(response.status).toEqual(401);
  });
  // TODO: make sure query params are ignored in originalUrl
  // TODO: issue an access token - bad request on invalid body vs dto
  // TODO: issue an access token - invalid email & password (all cases)
  // -- end of general checks
  // -- start of admin cases
  // log in as admin
  it('should log the admin user in successfully', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/accessToken`, {
      body: JSON.stringify({
        auth: {
          password: 'AdminPassword',
          type: 'userLocal'
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
  // TODO: find users (no options)
  // TODO: find users (pagination, page 1 and 2)
  // TODO: find users (sorting)
  // TODO: find users (no sorting and pagination)
  // find users - full range of options - filters, included relations, ordering, multi-data-service search
  it('should find users: full range of options - filters, included relations, ordering, multi-data-service search', async () => {
    const response = await fetch(
      `${BASE_URL_COURSE_PLATFORM}/users?` +
        'persistanceServices[]=main&persistanceServices[]=cache&' +
        'optionsOverridesByService[cache][filterByFirstServiceResultFields][id]=id&' +
        'optionsOverridesByService[cache][runOnNoFirstServiceResultOnly]=false&' +
        'optionsOverridesByService[cache][individualSearch]=true&' +
        `filters[createdAt][$gte]=${encodeURIComponent('2020-01-01 00:00:00')}&` +
        `filters[createdAt][$lte]=${encodeURIComponent('2030-01-01 00:00:00')}`,
      {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
          'content-type': 'application/json'
        },
        method: HttpMethod.GET
      }
    );
    const responseBody = await response.json();
    expect(response.status).toEqual(200);
    console.log(responseBody);
  });
  // -- end of admin cases
  // -- start of user 0 cases - CRUD functionality, mutation of input and output data
  // TODO: log in as user 0
  // TODO: find courses (no options)
  // TODO: find courses (pagination, page 1 and 2)
  // TODO: find courses (sorting)
  // TODO: find courses (no sorting and pagination)
  // TODO: error cases for authorization points
  // -- end of user 0 cases
});
