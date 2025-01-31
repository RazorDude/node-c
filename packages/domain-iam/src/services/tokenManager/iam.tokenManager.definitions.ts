export type CreateAccessTokenOptions = CreateTokenOptions;

export interface CreateTokenOptions {
  expiresInMinutes?: number;
  identifierDataField?: string;
  persist?: boolean;
  purgeOldFromPersistance?: boolean;
}

export type CreateRefreshTokenOptions = CreateTokenOptions;

export type DecodedTokenContent<TokenData> = {
  exp?: number;
  iat: number;
  data?: TokenData;
};

export type StoredToken<StoredTokenFields> = {
  token: string;
  type: TokenType;
} & StoredTokenFields;

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

export interface VerifyAccessTokenReturnData<TokenData> {
  content?: DecodedTokenContent<TokenData>;
  newToken?: string;
}
