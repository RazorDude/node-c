import { AppConfigDomainIAMAuthenticationStep, GenericObjectClass } from '@node-c/core';
import { IAMUserManagerAuthenticateOptions } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SSOUsersAuthenticatePassthroughAuthDto extends GenericObjectClass {
  @IsOptional()
  @IsString()
  externalAccessToken?: string;

  @IsNumber()
  @IsOptional()
  externalAccessTokenExpiresIn?: number;

  @IsOptional()
  @IsString()
  externalIdToken?: string;

  @IsOptional()
  @IsString()
  externalRefreshToken?: string;

  @IsNumber()
  @IsOptional()
  externalRefreshTokenExpiresIn?: number;
}

export class SSOUsersAuthenticatePassthroughFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class SSOUsersAuthenticatePassthroughDto implements Omit<
  IAMUserManagerAuthenticateOptions,
  'auth' | 'mainFilterField'
> {
  @IsDefined()
  @IsObject()
  @Type(() => SSOUsersAuthenticatePassthroughAuthDto)
  @ValidateNested()
  auth: SSOUsersAuthenticatePassthroughAuthDto;

  @IsOptional()
  @IsObject()
  @Type(() => SSOUsersAuthenticatePassthroughFiltersDto)
  @ValidateNested()
  filters?: SSOUsersAuthenticatePassthroughFiltersDto;

  @IsOptional()
  @IsString()
  step?: AppConfigDomainIAMAuthenticationStep;
}
