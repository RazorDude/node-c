import {
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerInitiateResult
} from '../authenticationConsumer/iam.authenticationConsumer.definitions.js';

import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult,
  IAMAuthenticationUserLocalInitiateData,
  IAMAuthenticationUserLocalInitiateOptions,
  IAMAuthenticationUserLocalInitiateResult
} from '../authenticationUserLocal/iam.authenticationUserLocal.definitions.js';

export type IAMAuthenticationUserLocalConsumerCompleteData = IAMAuthenticationUserLocalCompleteData;

export type IAMAuthenticationUserLocalConsumerCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type IAMAuthenticationUserLocalConsumerCompleteResult = IAMAuthenticationUserLocalCompleteResult &
  IAMAuthenticationConsumerCompleteResult;

export type IAMAuthenticationUserLocalConsumerInitiateData = IAMAuthenticationUserLocalInitiateData;

export type IAMAuthenticationUserLocalConsumerInitiateOptions<Context extends object> =
  IAMAuthenticationUserLocalInitiateOptions<Context>;

export type IAMAuthenticationUserLocalConsumerInitiateResult = IAMAuthenticationUserLocalInitiateResult &
  IAMAuthenticationConsumerInitiateResult;
