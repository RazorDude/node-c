import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// the query of Okta's authorization endpoint
export class APIOktaMockOAuth2AuthorizeDto {
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  code_challenge: string;

  @IsString()
  @IsNotEmpty()
  code_challenge_method: string;

  // the email of the user to log in - the mock has no login page
  @IsOptional()
  @IsString()
  login_hint?: string;

  @IsOptional()
  @IsString()
  nonce?: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsNotEmpty()
  response_type: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
