import { GenericObjectClass } from '@node-c/core';
import { CreateAccessTokenOptions, UserAuthType, UserMFAType } from '@node-c/domain-iam';

import { IsDefined, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SSOUsersCreateAccessTokenAuthDto extends GenericObjectClass {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  type: UserAuthType;

  @IsOptional()
  @IsString()
  mfaType?: UserMFAType;
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
  @ValidateNested()
  auth: SSOUsersCreateAccessTokenAuthDto;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  filters: SSOUsersCreateAccessTokenFiltersDto;
}
