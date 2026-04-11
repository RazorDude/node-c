import {
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication';
import {
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationConsumerInitiateResult,
  IAMAuthenticationConsumerRefreshExternalAccessTokenResult
} from '../authenticationConsumer';

import {
  IAMAuthenticationOAuth2CompleteData,
  IAMAuthenticationOAuth2CompleteOptions,
  IAMAuthenticationOAuth2CompleteResult,
  IAMAuthenticationOAuth2InitiateData,
  IAMAuthenticationOAuth2InitiateOptions,
  IAMAuthenticationOAuth2InitiateResult,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenData,
  IAMAuthenticationOAuth2VerifyExternalAccessTokenResult
} from '../authenticationOAuth2';

export type IAMAuthenticationOAuth2ConsumerCompleteData = IAMAuthenticationOAuth2CompleteData;

export type IAMAuthenticationOAuth2ConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationOAuth2CompleteOptions<Context>;

export type IAMAuthenticationOAuth2ConsumerCompleteResult = IAMAuthenticationOAuth2CompleteResult &
  IAMAuthenticationConsumerCompleteResult & {
    idToken?: string;
    refreshToken?: string;
  };

export type IAMAuthenticationOAuth2ConsumerGetUserAuthenticationConfigResult =
  IAMAuthenticationConsumerGetUserAuthenticationConfigResult;

export interface IAMAuthenticationOAuth2ConsumerInitiateData extends IAMAuthenticationOAuth2InitiateData {
  scope: string;
}

export type IAMAuthenticationOAuth2ConsumerInitiateOptions<Context extends object> =
  IAMAuthenticationOAuth2InitiateOptions<Context>;

export type IAMAuthenticationOAuth2ConsumerInitiateResult = IAMAuthenticationOAuth2InitiateResult &
  IAMAuthenticationConsumerInitiateResult;

export type IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenData =
  IAMAuthenticationRefreshExternalAccessTokenData;
export type IAMAuthenticationOAuth2ConsumerRefreshExternalAccessTokenResult =
  IAMAuthenticationRefreshExternalAccessTokenResult & IAMAuthenticationConsumerRefreshExternalAccessTokenResult;

export type IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenData =
  IAMAuthenticationOAuth2VerifyExternalAccessTokenData;

export type IAMAuthenticationOAuth2ConsumerVerifyExternalAccessTokenResult =
  IAMAuthenticationOAuth2VerifyExternalAccessTokenResult;
