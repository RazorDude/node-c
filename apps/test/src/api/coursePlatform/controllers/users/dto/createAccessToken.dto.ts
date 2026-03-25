import { AppConfigDomainIAMAuthenticationStep, GenericObjectClass } from '@node-c/core';
import { IAMAuthenticationType, IAMMFAType, IAMUserManagerCreateAccessTokenOptions } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CoursePlatformUsersCreateAccessTokenAuthDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  type: IAMAuthenticationType;

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

export class CoursePlatformUsersCreateAccessTokenFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CoursePlatformUsersCreateAccessTokenDto implements Omit<
  IAMUserManagerCreateAccessTokenOptions,
  'mainFilterField'
> {
  @IsDefined()
  @IsObject()
  @Type(() => CoursePlatformUsersCreateAccessTokenAuthDto)
  @ValidateNested()
  auth: CoursePlatformUsersCreateAccessTokenAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => CoursePlatformUsersCreateAccessTokenFiltersDto)
  @ValidateNested()
  filters?: CoursePlatformUsersCreateAccessTokenFiltersDto;

  @IsOptional()
  @IsString()
  step?: AppConfigDomainIAMAuthenticationStep;
}
