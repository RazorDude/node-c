import { FindDto } from '@node-c/api-rest';

import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

import { DataDBCourse } from '../../../../../data/db/entities/db.entities.js';

export class CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions {
  @IsObject()
  @IsOptional()
  serviceOptions?: unknown;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsOptional()
  @IsBooleanString()
  useResultsForFirstService?: boolean;
}

/** We need this class to specifically enable saveAdditionalResultsInFirstService, since we don't want it enabled by default on all controllers in NodeC. */
export class CoursePlatformStandaloneCoursesFindDto extends FindDto<DataDBCourse> {
  @IsOptional()
  @IsObject()
  @Type(() => CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions)
  @ValidateNested()
  saveAdditionalResultsInFirstService?: CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions;
}
