import {
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication';
import {
  IAMAuthenticationNodeCCompleteResult,
  IAMAuthenticationNodeCInitiateResult,
  IAMAuthenticationNodeCRefreshExternalAccessTokenResult
} from '../authenticationNodeC';

import {
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult
} from '../authenticationOAuth2';

export type IAMAuthenticationOAuth2NodeCCompleteData = IAMAuthenticationOAuth2CompleteData;

export type IAMAuthenticationOAuth2NodeCCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2CompleteOptions<Context>;

export type IAMAuthenticationOAuth2NodeCCompleteResult = IAMAuthenticationOAuth2CompleteResult &
  IAMAuthenticationNodeCCompleteResult & {
    idToken?: string;
    refreshToken?: string;
  };

export interface IAMAuthenticationOAuth2NodeCInitiateData extends IAMAuthenticationOAuth2InitiateData {
  scope: string;
}

export type IAMAuthenticationOAuth2NodeCInitiateOptions<Context extends object> =
  IAMAuthenticationOAuth2InitiateOptions<Context>;

export type IAMAuthenticationOAuth2NodeCInitiateResult = IAMAuthenticationOAuth2InitiateResult &
  IAMAuthenticationNodeCInitiateResult;

export type IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenData =
  IAMAuthenticationRefreshExternalAccessTokenData;
export type IAMAuthenticationOAuth2NodeCRefreshExternalAccessTokenResult =
  IAMAuthenticationRefreshExternalAccessTokenResult & IAMAuthenticationNodeCRefreshExternalAccessTokenResult;
