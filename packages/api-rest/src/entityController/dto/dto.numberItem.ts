import { PersistanceNumberItem } from '@node-c/core';
import { IsBoolean, IsDefined, IsNumber, IsOptional } from 'class-validator';

export class NumberItemDto implements PersistanceNumberItem {
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsDefined()
  @IsNumber()
  value: number;
}
