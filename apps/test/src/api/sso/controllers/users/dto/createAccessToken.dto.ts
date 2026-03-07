import { AppConfigDomainIAMAuthenticationStep, GenericObjectClass } from '@node-c/core';
import { IAMAuthenticationType, IAMMFAType, IAMUsersCreateAccessTokenOptions } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SSOUsersCreateAccessTokenAuthDto extends GenericObjectClass {
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

export class SSOUsersCreateAccessTokenFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class SSOUsersCreateAccessTokenDto implements Omit<IAMUsersCreateAccessTokenOptions, 'mainFilterField'> {
  @IsDefined()
  @IsObject()
  @Type(() => SSOUsersCreateAccessTokenAuthDto)
  @ValidateNested()
  auth: SSOUsersCreateAccessTokenAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => SSOUsersCreateAccessTokenFiltersDto)
  @ValidateNested()
  filters?: SSOUsersCreateAccessTokenFiltersDto;

  @IsOptional()
  @IsString()
  step?: AppConfigDomainIAMAuthenticationStep;
}
