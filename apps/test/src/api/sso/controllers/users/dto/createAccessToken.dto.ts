import { IsDefined, IsObject, ValidateNested } from 'class-validator';

export class CreateAccessTokenDto extends CreateAccessTokenOptions {
  @IsDefined()
  @IsObject()
  @ValidateNested()
  data: Entity;
}
