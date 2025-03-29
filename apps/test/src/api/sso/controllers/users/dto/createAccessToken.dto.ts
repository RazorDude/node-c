import { CreateAccessTokenOptions, UserAuthType, UserMFAType } from '@node-c/domain-iam';

import { IsDefined, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

export class SSOUsersCreateAccessTokenDto implements CreateAccessTokenOptions {
  @IsDefined()
  @IsObject()
  @ValidateNested()
  auth: { type: UserAuthType; mfaType?: UserMFAType };

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  email: string;
}
