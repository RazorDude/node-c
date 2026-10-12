import { BulkCreateDto as BaseBulkCreateDto } from './dto/bulkCreate.dto.js';
import { CreateDto as BaseCreateDto } from './dto/create.dto.js';
import { DeleteDto as BaseDeleteDto } from './dto/delete.dto.js';
import { FindDto as BaseFindDto } from './dto/find.dto.js';
import { FindOneDto as BaseFindOneDto } from './dto/findOne.dto.js';
import { UpdateDto as BaseUpdateDto } from './dto/update.dto.js';

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity>;
  Create: BaseCreateDto<Entity>;
  Delete: BaseDeleteDto;
  Find: BaseFindDto;
  FindOne: BaseFindOneDto;
  Update: BaseUpdateDto<Entity>;
}
