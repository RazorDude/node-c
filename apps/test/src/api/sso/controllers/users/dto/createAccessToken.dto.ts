import { GenericObjectClass } from '@node-c/core';
import { CreateAccessTokenOptions, UserAuthType, UserMFAType } from '@node-c/domain-iam';

import { Type } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SSOUsersCreateAccessTokenAuthDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  type: UserAuthType;

  @IsOptional()
  @IsString()
  mfaType?: UserMFAType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;
}

export class SSOUsersCreateAccessTokenFiltersDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class SSOUsersCreateAccessTokenDto implements Omit<CreateAccessTokenOptions, 'mainFilterField'> {
  @IsDefined()
  @IsObject()
  @Type(() => SSOUsersCreateAccessTokenAuthDto)
  @ValidateNested()
  auth: SSOUsersCreateAccessTokenAuthDto;

  @IsDefined()
  @IsObject()
  @Type(() => SSOUsersCreateAccessTokenFiltersDto)
  @ValidateNested()
  filters: SSOUsersCreateAccessTokenFiltersDto;
}
