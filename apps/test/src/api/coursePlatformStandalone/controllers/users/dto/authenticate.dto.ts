import { GenericObjectClass } from '@node-c/core';
import { IAMAuthenticationManagerAuthenticateOptions, IAMMFAType } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

interface AuthenticateAuthWithoutType {
  auth: Omit<IAMAuthenticationManagerAuthenticateOptions['auth'], 'type'>;
}
type AuthenticateOptionsCustom = Omit<IAMAuthenticationManagerAuthenticateOptions, 'auth' | 'mainFilterField'>;
type AuthenticateOptionsCustomFinal = AuthenticateOptionsCustom & AuthenticateAuthWithoutType;

export class APICoursePlatformStandaloneUsersAuthenticateAuthDto extends GenericObjectClass {
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

export class APICoursePlatformStandaloneUsersAuthenticateFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class APICoursePlatformStandaloneUsersAuthenticateDto implements AuthenticateOptionsCustomFinal {
  @IsDefined()
  @IsObject()
  @Type(() => APICoursePlatformStandaloneUsersAuthenticateAuthDto)
  @ValidateNested()
  auth: APICoursePlatformStandaloneUsersAuthenticateAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => APICoursePlatformStandaloneUsersAuthenticateFiltersDto)
  @ValidateNested()
  filters?: APICoursePlatformStandaloneUsersAuthenticateFiltersDto;
}
