import type { AppConfig, AppConfigDomainIAM } from '@node-c/core';

export interface AppConfigDomainOktaMock {
  accessTokenExpiresInSeconds: number;
  authorizationCodeLengthInBytes: number;
  refreshTokenLengthInBytes: number;
}

export type AppConfigTestApp = AppConfig & {
  domain: {
    iam: AppConfigDomainIAM;
    oktaMock: AppConfigDomainOktaMock;
  };
};

export interface PlaceholderCommonDefinition {
  property: string;
}
