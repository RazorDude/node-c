import * as NodeCCore from '@node-c/core';

import { IsBoolean, IsDefined, IsNotEmptyObject, IsObject, IsOptional } from 'class-validator';

import { BaseDto } from './base.dto';

export class DeleteDto<Options extends NodeCCore.DomainDeleteOptions>
  extends BaseDto<Options>
  implements NodeCCore.DomainDeleteOptions
{
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  filters: NodeCCore.GenericObject<unknown>;

  @IsBoolean()
  @IsOptional()
  returnOriginalItems?: boolean;
}
