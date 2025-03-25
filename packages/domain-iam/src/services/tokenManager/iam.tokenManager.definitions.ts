import { DomainCreateOptions } from '@node-c/core';

export type DecodedTokenContent<TokenEntityFields> = {
  exp?: number;
  iat: number;
  data?: TokenEntityFields;
};

export type TokenEntity<TokenEntityFields extends object> = {
  token: string;
  type: TokenType;
} & TokenEntityFields;

export type TokenManagerCreateData<TokenEntityFields extends object> = Partial<
  Omit<TokenEntity<TokenEntityFields>, 'token'>
>;

export type TokenManagerCreateOptions = {
  expiresInMinutes?: number;
  identifierDataField?: string;
  persist?: boolean;
  purgeOldFromPersistance?: boolean;
} & DomainCreateOptions;

export enum TokenType {
  // eslint-disable-next-line no-unused-vars
  Access = 'access',
  // eslint-disable-next-line no-unused-vars
  Refresh = 'refresh'
}

export interface VerifyAccessTokenOptions {
  deleteFromStoreIfExpired?: boolean;
  identifierDataField?: string;
  newTokenExpiresInMinutes?: number;
  persistNewToken?: boolean;
  purgeStoreOnRenew?: boolean;
  refreshToken?: string;
  refreshTokenAccessTokenIdentifierDataField?: string;
}

export interface VerifyAccessTokenReturnData<TokenEntityFields> {
  content?: DecodedTokenContent<TokenEntityFields>;
  newToken?: string;
}
