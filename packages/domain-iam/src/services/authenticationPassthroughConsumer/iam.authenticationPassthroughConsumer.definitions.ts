import {
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication';

import {
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationConsumerInitiateResult
} from '../authenticationConsumer';

import {
  IAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult,
  IAMAuthenticationPassthroughGetUserAuthenticationConfigResult,
  IAMAuthenticationPassthroughInitiateData,
  IAMAuthenticationPassthroughInitiateOptions,
  IAMAuthenticationPassthroughInitiateResult
} from '../authenticationPassthrough';

export type IAMAuthenticationPassthroughConsumerCompleteData = IAMAuthenticationPassthroughCompleteData & {
  externalAccessToken?: string;
  externalAccessTokenExpiresIn?: number;
  externalIdToken?: string;
  externalRefreshToken?: string;
  externalRefreshTokenExpiresIn?: number;
};

export type IAMAuthenticationPassthroughConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationPassthroughCompleteOptions<Context>;

export type IAMAuthenticationPassthroughConsumerCompleteResult = IAMAuthenticationPassthroughCompleteResult &
  IAMAuthenticationConsumerCompleteResult;

export type IAMAuthenticationPassthroughConsumerGetUserAuthenticationConfigResult =
  IAMAuthenticationPassthroughGetUserAuthenticationConfigResult &
    IAMAuthenticationConsumerGetUserAuthenticationConfigResult;

export type IAMAuthenticationPassthroughConsumerInitiateData = IAMAuthenticationPassthroughInitiateData;

export type IAMAuthenticationPassthroughConsumerInitiateOptions<Context extends object> =
  IAMAuthenticationPassthroughInitiateOptions<Context>;

export type IAMAuthenticationPassthroughConsumerInitiateResult = IAMAuthenticationPassthroughInitiateResult &
  IAMAuthenticationConsumerInitiateResult;

export type IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenData =
  IAMAuthenticationRefreshExternalAccessTokenData;

export type IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult =
  IAMAuthenticationRefreshExternalAccessTokenResult;
