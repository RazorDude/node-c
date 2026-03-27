import { AppConfigDomainIAMAuthenticationStep, GenericObjectClass } from '@node-c/core';
import { IAMMFAType, IAMUserManagerAuthenticateOptions } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SSOUsersAuthenticateAuthDto extends GenericObjectClass {
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

export class SSOUsersAuthenticateFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class SSOUsersAuthenticateDto implements Omit<IAMUserManagerAuthenticateOptions, 'mainFilterField'> {
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

  @IsOptional()
  @IsString()
  step?: AppConfigDomainIAMAuthenticationStep;
}
