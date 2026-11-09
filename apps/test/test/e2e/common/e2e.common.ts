/** biome-ignore-all lint/correctness/noUndeclaredDependencies: Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { expect } from 'vitest';

import { TestUser, TestUserLoginLog } from './e2e.common.definitions.js';

export const BASE_URL_COURSE_PLATFORM_DELEGATED = 'http://localhost:2071';
export const BASE_URL_SSO = 'http://localhost:2081';

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
