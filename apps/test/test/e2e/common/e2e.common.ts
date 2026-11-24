
import { HttpStatus } from '@nestjs/common';

import { type GenericObject, HttpMethod } from '@node-c/core';

import { expect } from 'vitest';

import {
  TestTokenPayload,
  TestUser,
  TestUserLoginLog
} from './e2e.common.definitions.js';

export const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
export const BASE_URL_COURSE_PLATFORM_FEDERATED = 'http://localhost:2061';
export const BASE_URL_COURSE_PLATFORM_STANDALONE = 'http://localhost:2051';
export const BASE_URL_OKTA_MOCK = 'http://localhost:2091';
export const BASE_URL_SSO = 'http://localhost:2081';

// initiates an Okta login through the SSO app, logs the user in at the Okta mock, and returns the URL that the Okta
// mock redirects to - the SSO app's callback, with the code and state (or an error) in the query
export async function authorizeWithOktaMock(loginHint: string): Promise<URL> {
  const initiateResponse = await fetch(`${BASE_URL_SSO}/users/auth/okta`, {
    body: JSON.stringify({ auth: {} }),
    headers: { 'content-type': 'application/json' },
    method: HttpMethod.POST
  });
  expect(initiateResponse.status).toEqual(HttpStatus.CREATED);
  const { authorizationCodeRequestURL } = await initiateResponse.json();
  const authorizeResponse = await fetch(
    `${authorizationCodeRequestURL}&login_hint=${encodeURIComponent(loginHint)}`,
    { redirect: 'manual' }
  );
  expect(authorizeResponse.status).toEqual(HttpStatus.FOUND);
  return new URL(authorizeResponse.headers.get('location')!);
}

// decodes a JWT's payload, without verifying it
export function decodeTokenPayload(token: string): TestTokenPayload {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

// finds all login logs visible to the user of the access token, ordered by datetime
export async function findAllUserLoginLogs(
  accessToken: string
): Promise<TestUserLoginLog[]> {
  const response = await fetch(
    `${BASE_URL_COURSE_PLATFORM_DELEGATED}/userLoginLogs?findAll=true&orderBy[datetime]=asc`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    }
  );
  expect(response.status).toEqual(HttpStatus.OK);
  const responseBody = await response.json();
  return responseBody.result.items;
}

// sends a GET request to the courses routes of an API and returns the response's status and body
export async function requestCourses(
  baseUrl: string,
  accessToken: string,
  pathAndQuery: string
): Promise<{ body: GenericObject; status: number }> {
  const response = await fetch(`${baseUrl}/courses${pathAndQuery}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json'
    },
    method: HttpMethod.GET
  });
  return { body: await response.json(), status: response.status };
}

export async function findUserByEmail(
  accessToken: string,
  email: string
): Promise<TestUser> {
  const response = await fetch(
    `${BASE_URL_COURSE_PLATFORM_DELEGATED}/users?filters[email]=${encodeURIComponent(email)}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      },
      method: HttpMethod.GET
    }
  );
  expect(response.status).toEqual(HttpStatus.OK);
  const responseBody = await response.json();
  return responseBody.result.items[0];
}

// logs a user in through the SSO app and returns the access token
export async function loginUser(
  email: string,
  password: string
): Promise<string> {
  const response = await fetch(`${BASE_URL_SSO}/users/auth/userLocal`, {
    body: JSON.stringify({
      auth: { password },
      filters: { email }
    }),
    headers: { 'content-type': 'application/json' },
    method: HttpMethod.POST
  });
  expect(response.status).toEqual(HttpStatus.CREATED);
  const responseBody = await response.json();
  return responseBody.accessToken;
}
