import { DataNumberItem } from '@node-c/core';
import { IsBoolean, IsDefined, IsNumber, IsOptional } from 'class-validator';

export class NumberItemDto implements DataNumberItem {
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsDefined()
  @IsNumber()
  value: number;
}
