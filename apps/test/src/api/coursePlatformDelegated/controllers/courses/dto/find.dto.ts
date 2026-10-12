import { dtoTransformBoolean, FindDto } from '@node-c/api-rest';

import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

export class CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions {
  @IsObject()
  @IsOptional()
  serviceOptions?: unknown;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsOptional()
  @IsBoolean()
  @Transform(dtoTransformBoolean)
  useResultsForFirstServiceReturnData?: boolean;
}

/** We need this class to specifically enable saveAdditionalResultsInFirstService, since we don't want it enabled by default on all controllers in NodeC. */
export class CoursePlatformStandaloneCoursesFindDto extends FindDto {
  @IsOptional()
  @IsObject()
  @Type(
    () =>
      CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions
  )
  @ValidateNested()
  saveAdditionalResultsInFirstService?: CoursePlatformStandaloneCoursesFindSaveAdditionalResultsInFirstServiceOptions;
}
