import {
  IAMAuthenticationCompleteData,
  IAMAuthenticationCompleteOptions,
  IAMAuthenticationCompleteResult,
  IAMAuthenticationGetUserAuthenticationConfigResult,
  IAMAuthenticationInitiateData,
  IAMAuthenticationInitiateOptions,
  IAMAuthenticationInitiateResult
} from '../authentication';

export type IAMAuthenticationUserLocalCompleteData = IAMAuthenticationCompleteData;

export type IAMAuthenticationUserLocalCompleteOptions<Context extends object> =
  IAMAuthenticationCompleteOptions<Context>;

export type IAMAuthenticationUserLocalCompleteResult = IAMAuthenticationCompleteResult;

export type IAMAuthenticationUserLocalGetUserAuthenticationConfigResult =
  IAMAuthenticationGetUserAuthenticationConfigResult;

export interface IAMAuthenticationUserLocalInitiateData extends IAMAuthenticationInitiateData {
  password: string;
}

export type IAMAuthenticationUserLocalInitiateOptions<Context extends object> = IAMAuthenticationInitiateOptions<
  { password: string } & Context
>;

export type IAMAuthenticationUserLocalInitiateResult = IAMAuthenticationInitiateResult;
