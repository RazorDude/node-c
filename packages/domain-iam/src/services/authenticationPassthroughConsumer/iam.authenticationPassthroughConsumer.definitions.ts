import {
  IAMAuthenticationRefreshExternalAccessTokenData,
  IAMAuthenticationRefreshExternalAccessTokenResult
} from '../authentication/iam.authentication.definitions.js';

import {
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerGetUserAuthenticationConfigResult,
  IAMAuthenticationConsumerInitiateResult
} from '../authenticationConsumer/iam.authenticationConsumer.definitions.js';

import {
  IAMAuthenticationPassthroughCompleteData,
  IAMAuthenticationPassthroughCompleteOptions,
  IAMAuthenticationPassthroughCompleteResult,
  IAMAuthenticationPassthroughGetUserAuthenticationConfigResult,
  IAMAuthenticationPassthroughInitiateData,
  IAMAuthenticationPassthroughInitiateOptions,
  IAMAuthenticationPassthroughInitiateResult
} from '../authenticationPassthrough/iam.authenticationPassthrough.definitions.js';

export type IAMAuthenticationPassthroughConsumerCompleteData =
  IAMAuthenticationPassthroughCompleteData & {
    externalAccessToken?: string;
    externalAccessTokenExpiresIn?: number;
    externalIdToken?: string;
    externalRefreshToken?: string;
    externalRefreshTokenExpiresIn?: number;
  };

export type IAMAuthenticationPassthroughConsumerCompleteOptions<
  Context extends object
> = IAMAuthenticationPassthroughCompleteOptions<Context>;

export type IAMAuthenticationPassthroughConsumerCompleteResult =
  IAMAuthenticationPassthroughCompleteResult &
    IAMAuthenticationConsumerCompleteResult;

export type IAMAuthenticationPassthroughConsumerGetUserAuthenticationConfigResult =
  IAMAuthenticationPassthroughGetUserAuthenticationConfigResult &
    // oxlint-disable-next-line typescript/no-duplicate-type-constituents -- Kept separate on purpose, for future extension.
    IAMAuthenticationConsumerGetUserAuthenticationConfigResult;

export type IAMAuthenticationPassthroughConsumerInitiateData =
  IAMAuthenticationPassthroughInitiateData;

export type IAMAuthenticationPassthroughConsumerInitiateOptions<
  Context extends object
> = IAMAuthenticationPassthroughInitiateOptions<Context>;

export type IAMAuthenticationPassthroughConsumerInitiateResult =
  IAMAuthenticationPassthroughInitiateResult &
    // oxlint-disable-next-line typescript/no-duplicate-type-constituents -- Kept separate on purpose, for future extension.
    IAMAuthenticationConsumerInitiateResult;

export type IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenData =
  IAMAuthenticationRefreshExternalAccessTokenData;

export type IAMAuthenticationPassthroughConsumerRefreshExternalAccessTokenResult =
  IAMAuthenticationRefreshExternalAccessTokenResult;
