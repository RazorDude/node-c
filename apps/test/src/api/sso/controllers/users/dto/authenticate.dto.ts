import { GenericObjectClass } from '@node-c/core';
import { IAMAuthenticationManagerAuthenticateOptions, IAMMFAType } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

interface AuthenticateAuthWithoutType {
  auth: Omit<IAMAuthenticationManagerAuthenticateOptions['auth'], 'type'>;
}
type AuthenticateOptionsCustom = Omit<IAMAuthenticationManagerAuthenticateOptions, 'auth' | 'mainFilterField'>;
type AuthenticateOptionsCustomFinal = AuthenticateOptionsCustom & AuthenticateAuthWithoutType;

export class SSOUsersAuthenticateAuthDto extends GenericObjectClass {
  // This is needed for Federated authentication
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  // This is needed for Federated authentication
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codeVerifier?: string;

  @IsOptional()
  @IsString()
  mfaType?: IAMMFAType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  // This is needed for Federated authentication
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  scope?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string;
}

export class SSOUsersAuthenticateFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class SSOUsersAuthenticateDto implements AuthenticateOptionsCustomFinal {
  @IsDefined()
  @IsObject()
  @Type(() => SSOUsersAuthenticateAuthDto)
  @ValidateNested()
  auth: SSOUsersAuthenticateAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => SSOUsersAuthenticateFiltersDto)
  @ValidateNested()
  filters?: SSOUsersAuthenticateFiltersDto;
}
