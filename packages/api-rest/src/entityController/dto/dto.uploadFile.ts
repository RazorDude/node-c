import { IsMimeType, IsNotEmpty, IsString } from 'class-validator';

export class UploadFileDto {
  @IsMimeType()
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
