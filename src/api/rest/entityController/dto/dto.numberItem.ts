import { IsBoolean, IsDefined, IsNumber, IsOptional } from 'class-validator';

export class NumberItemDto {
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsDefined()
  @IsNumber()
  value: number;
}
