/* oxlint-disable eslint/no-magic-numbers -- Test file. */
/* oxlint-disable eslint/no-console -- Test file. */

import { HttpStatus } from '@nestjs/common';

import { HttpMethod } from '@node-c/core';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  authorizeWithOktaMock,
  BASE_URL_COURSE_PLATFORM_DELEGATED,
  BASE_URL_OKTA_MOCK,
  BASE_URL_SSO,
  decodeTokenPayload,
  loginUser,
  requestCourses
} from './common/e2e.common.js';

// The delegated API has no login routes - its users log in through the SSO app. Here, they log in with Okta, which is
// mocked by the oktaMock API (apps/test/src/api/oktaMock), and the tokens are then used in the delegated API.
describe('NodeC.Apps.Test.CoursePlatformDelegated - Okta login through the SSO app', () => {
  let callbackUrl: URL;
  let user0AccessToken = '';
  let user0OktaAccessToken = '';
  let user0OktaIdToken = '';
  beforeAll(async () => {
    user0AccessToken = await loginUser('user0@node-c.com', 'User0Password');
  });
  // initiate an Okta login - the SSO app returns the URL of Okta's authorization endpoint
  it('should return the authorization code request URL when initiating an Okta login', async () => {
    const response = await fetch(`${BASE_URL_SSO}/users/auth/okta`, {
      body: JSON.stringify({ auth: {} }),
      headers: { 'content-type': 'application/json' },
      method: HttpMethod.POST
    });
    expect(response.status).toEqual(HttpStatus.CREATED);
    const responseBody = await response.json();
    expect(responseBody).not.toHaveProperty('accessToken');
    const url = new URL(responseBody.authorizationCodeRequestURL);
    expect(`${url.origin}${url.pathname}`).toEqual(
      `${BASE_URL_OKTA_MOCK}/oauth2/v1/authorize`
    );
    expect(url.searchParams.get('response_type')).toEqual('code');
    expect(url.searchParams.get('redirect_uri')).toEqual(
      `${BASE_URL_SSO}/users/auth/okta`
    );
    expect(url.searchParams.get('scope')).toEqual(
      'openid profile email groups offline_access'
    );
    expect(url.searchParams.get('code_challenge_method')).toEqual('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('nonce')).toBeTruthy();
    expect(url.searchParams.get('state')).toBeTruthy();
  });
  // log user 0 in with Okta - the Okta mock redirects to the SSO app's callback with a code, and the SSO app exchanges it
  it('should log user 0 in with Okta', async () => {
    callbackUrl = await authorizeWithOktaMock('user0@node-c.com');
    expect(`${callbackUrl.origin}${callbackUrl.pathname}`).toEqual(
      `${BASE_URL_SSO}/users/auth/okta`
    );
    const response = await fetch(callbackUrl);
    expect(response.status).toEqual(HttpStatus.OK);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('idToken');
    expect(responseBody).toHaveProperty('refreshToken');
    user0OktaAccessToken = responseBody.accessToken;
    user0OktaIdToken = responseBody.idToken;
  });
  // the local tokens get the lifetime of Okta's access token (expires_in is 3600 seconds in the Okta mock)
  it("should issue the local access and id tokens with the lifetime of Okta's access token", () => {
    const accessTokenPayload = decodeTokenPayload(user0OktaAccessToken);
    const idTokenPayload = decodeTokenPayload(user0OktaIdToken);
    expect(accessTokenPayload.exp - accessTokenPayload.iat).toEqual(3600);
    expect(idTokenPayload.exp - idTokenPayload.iat).toEqual(3600);
  });
  // find courses as user 0 with the Okta login - the same as with the password login
  it('should find only the assigned courses as user 0 in the delegated API, the same as with the password login', async () => {
    const oktaResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0OktaAccessToken,
      ''
    );
    const passwordResponse = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0AccessToken,
      ''
    );
    expect(oktaResponse.status).toEqual(HttpStatus.OK);
    expect(oktaResponse.body).toHaveProperty('result');
    expect(oktaResponse.body.result).toEqual(passwordResponse.body.result);
  });
  // throw a forbidden error when user 0 tries to find a course that isn't assigned to them - the same as with the password login
  it("should throw a forbidden error when user 0 tries to find a course that isn't assigned to them in the delegated API", async () => {
    // course 3 isn't free and isn't assigned to user 0
    const response = await requestCourses(
      BASE_URL_COURSE_PLATFORM_DELEGATED,
      user0OktaAccessToken,
      '?filters[id]=3'
    );
    expect(response.status).toEqual(HttpStatus.FORBIDDEN);
    expect(response.body).not.toHaveProperty('result');
  });
  // fail to complete an Okta login with an authorization code that was already used - Okta rejects it
  it('should fail to complete an Okta login with an authorization code that was already used', async () => {
    const response = await fetch(callbackUrl);
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // fail to complete an Okta login with a state that the SSO app didn't issue - there's no stored PKCE verifier for it
  it("should fail to complete an Okta login with a state that the SSO app didn't issue", async () => {
    const validCallbackUrl = await authorizeWithOktaMock('user0@node-c.com');
    const code = validCallbackUrl.searchParams.get('code')!;
    const response = await fetch(
      `${BASE_URL_SSO}/users/auth/okta?code=${code}&state=unknownState`
    );
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toEqual('Authentication failed.');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
  // Okta redirects back with an error and no code for a user that can't log in - the SSO app rejects the callback
  it("should fail to complete an Okta login when Okta doesn't return an authorization code", async () => {
    const errorCallbackUrl = await authorizeWithOktaMock('nobody@node-c.com');
    expect(errorCallbackUrl.searchParams.get('error')).toEqual('access_denied');
    expect(errorCallbackUrl.searchParams.get('code')).toBeNull();
    const response = await fetch(errorCallbackUrl);
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('code should not be null or undefined');
    expect(responseBody).not.toHaveProperty('accessToken');
  });
});
