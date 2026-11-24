import { IsOptional, IsString } from 'class-validator';

// the form data of Okta's token endpoint - checked in the service, so that invalid requests get an OAuth2 error
export class APIOktaMockOAuth2TokenDto {
  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsString()
  client_secret?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  code_verifier?: string;

  @IsOptional()
  @IsString()
  grant_type?: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;
}
