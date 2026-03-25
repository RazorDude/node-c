import { IAMAuthenticationNodeCCompleteResult, IAMAuthenticationNodeCInitiateResult } from '../authenticationNodeC';

import {
  IAMAuthenticationUserLocalCompleteData,
  IAMAuthenticationUserLocalCompleteOptions,
  IAMAuthenticationUserLocalCompleteResult,
  IAMAuthenticationUserLocalInitiateData,
  IAMAuthenticationUserLocalInitiateOptions,
  IAMAuthenticationUserLocalInitiateResult
} from '../authenticationUserLocal';

export type IAMAuthenticationUserLocalNodeCCompleteData = IAMAuthenticationUserLocalCompleteData;

export type IAMAuthenticationUserLocalNodeCCompleteOptions<Context extends object> =
  IAMAuthenticationUserLocalCompleteOptions<Context>;

export type IAMAuthenticationUserLocalNodeCCompleteResult = IAMAuthenticationUserLocalCompleteResult &
  IAMAuthenticationNodeCCompleteResult;

export type IAMAuthenticationUserLocalNodeCInitiateData = IAMAuthenticationUserLocalInitiateData;

export type IAMAuthenticationUserLocalNodeCInitiateOptions<Context extends object> =
  IAMAuthenticationUserLocalInitiateOptions<Context>;

export type IAMAuthenticationUserLocalNodeCInitiateResult = IAMAuthenticationUserLocalInitiateResult &
  IAMAuthenticationNodeCInitiateResult;
