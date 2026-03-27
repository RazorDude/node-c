import { AppConfigDomainIAMAuthenticationStep, GenericObjectClass } from '@node-c/core';
import { IAMMFAType, IAMUserManagerAuthenticateOptions } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CoursePlatformUsersAuthenticateAuthDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  type: string;

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

export class CoursePlatformUsersAuthenticateFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class CoursePlatformUsersAuthenticateDto implements Omit<IAMUserManagerAuthenticateOptions, 'mainFilterField'> {
  @IsDefined()
  @IsObject()
  @Type(() => CoursePlatformUsersAuthenticateAuthDto)
  @ValidateNested()
  auth: CoursePlatformUsersAuthenticateAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => CoursePlatformUsersAuthenticateFiltersDto)
  @ValidateNested()
  filters?: CoursePlatformUsersAuthenticateFiltersDto;

  @IsOptional()
  @IsString()
  step?: AppConfigDomainIAMAuthenticationStep;
}
