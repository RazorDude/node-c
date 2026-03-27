import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SSOUsersAuthenticateOAuth2CallbackDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codeVerifier?: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  state: string;
}
