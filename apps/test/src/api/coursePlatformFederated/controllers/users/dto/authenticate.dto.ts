import { GenericObjectClass } from '@node-c/core';
import { IAMAuthenticationManagerAuthenticateOptions, IAMMFAType } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

interface AuthenticateAuthWithoutType {
  auth: Omit<IAMAuthenticationManagerAuthenticateOptions['auth'], 'type'>;
}
type AuthenticateOptionsCustom = Omit<IAMAuthenticationManagerAuthenticateOptions, 'auth' | 'mainFilterField'>;
type AuthenticateOptionsCustomFinal = AuthenticateOptionsCustom & AuthenticateAuthWithoutType;

export class APICoursePlatformFederatedUsersAuthenticateAuthDto extends GenericObjectClass {
  @IsOptional()
  @IsString()
  mfaType?: IAMMFAType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  scope?: string;
}

export class APICoursePlatformFederatedUsersAuthenticateFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class APICoursePlatformFederatedUsersAuthenticateDto implements AuthenticateOptionsCustomFinal {
  @IsDefined()
  @IsObject()
  @Type(() => APICoursePlatformFederatedUsersAuthenticateAuthDto)
  @ValidateNested()
  auth: APICoursePlatformFederatedUsersAuthenticateAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => APICoursePlatformFederatedUsersAuthenticateFiltersDto)
  @ValidateNested()
  filters?: APICoursePlatformFederatedUsersAuthenticateFiltersDto;
}
