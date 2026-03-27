import {
  IAMAuthenticationConsumerCompleteResult,
  IAMAuthenticationConsumerInitiateResult
} from '../authenticationConsumer';

import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult,
  IAMAuthenticationUserLocalInitiateData,
  IAMAuthenticationUserLocalInitiateOptions,
  IAMAuthenticationUserLocalInitiateResult
} from '../authenticationUserLocal';

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
