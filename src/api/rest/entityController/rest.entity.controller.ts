import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Type,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';

import {
  DeleteDto as BaseDeleteDto,
  FindDto as BaseFindDto,
  FindOneDto as BaseFindOneDto,
  UpdateDto as BaseUpdateDto
} from './dto';
import { UpdateBody } from './rest.entity.controller.definitions';

import { GenericObject, GenericObjectClass } from '../../../common/definitions';
import { DomainPersistanceEntityService } from '../../../domain/common/entityService';
import {
  DeleteOptions,
  DeleteResult,
  FindOneOptions,
  FindOptions,
  FindResults,
  PersistanceEntityService,
  UpdateResult
} from '../../../persistance/common/entityService';

import { HTTPAuthorizationInterceptor, HTTPErrorInterceptor } from '../../http/interceptors';

@UseInterceptors(HTTPAuthorizationInterceptor, HTTPErrorInterceptor)
export class RESTAPIEntityControlerWithoutDto<
  Entity,
  EntityDomainService extends DomainPersistanceEntityService<Entity, PersistanceEntityService<Entity>>
> {
  inUseDefaultRoutes: { [functionName: string]: boolean };

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected domainEntityService: EntityDomainService,
    // eslint-disable-next-line no-unused-vars
    protected defaultRoutes?: string[]
  ) {
    this.refreshDefaultRoutes();
  }

  protected checkRoute(functionName: string): void {
    if (!this.inUseDefaultRoutes || !this.inUseDefaultRoutes[functionName]) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public bulkCreate(_body: GenericObject[], ..._args: unknown[]): Promise<Entity[] | void>;
  @Post('bulk')
  async bulkCreate(@Body() body: GenericObject[]): Promise<Entity[]> {
    this.checkRoute('bulkCreate');
    return await this.domainEntityService.bulkCreate(body);
  }

  public create(_body: GenericObject, ..._args: unknown[]): Promise<Entity | void>;
  @Post()
  async create(@Body() body: GenericObject): Promise<Entity> {
    this.checkRoute('create');
    return await this.domainEntityService.create(body);
  }

  public delete(_body: DeleteOptions, ..._args: unknown[]): Promise<DeleteResult | void>;
  @Delete()
  async delete(@Body() body: DeleteOptions): Promise<DeleteResult> {
    this.checkRoute('delete');
    return await this.domainEntityService.delete(body);
  }

  public find(_query: FindOptions, ..._args: unknown[]): Promise<FindResults<Entity> | void>;
  @Get()
  async find(@Query() query: FindOptions): Promise<FindResults<Entity> | void> {
    this.checkRoute('find');
    return await this.domainEntityService.find(query);
  }

  public findOne(_id: number | string, _query: FindOneOptions, ..._args: unknown[]): Promise<Entity | null | void>;
  @Get('/item/:id')
  async findOne(@Param() id: number | string, @Query() query: FindOneOptions): Promise<Entity | null | void> {
    this.checkRoute('findOne');
    let filters = query.filters;
    if (!filters) {
      filters = {};
      query.filters = filters;
    }
    filters.id = id;
    return await this.domainEntityService.findOne(query);
  }

  refreshDefaultRoutes(): void {
    this.inUseDefaultRoutes = {};
    if (this.defaultRoutes instanceof Array) {
      this.defaultRoutes.forEach(item => (this.inUseDefaultRoutes[item] = true));
    }
  }

  public update(_body: UpdateBody, ..._args: unknown[]): Promise<UpdateResult<Entity> | void>;
  @Patch()
  async update(@Body() body: UpdateBody): Promise<UpdateResult<Entity>> {
    this.checkRoute('update');
    return await this.domainEntityService.update(body.data, { filters: body.filters });
  }
}

/*
 * For reference on why the dto validation was done in this way - it's a limitation of Typescript itself:
 * the compiler doesn't emit generic type metadata, making it impossible to achieve a DRY OOP base class with schema validation.
 * At this point, it's a decade-old issue - see https://www.typescriptneedstypes.com/ for more details.
 */
export class RESTAPIEntityControler<
  Entity,
  EntityDomainService extends DomainPersistanceEntityService<Entity, PersistanceEntityService<Entity>>,
  CreateDto extends GenericObject,
  BulkCreateDto extends GenericObject[],
  FindDto extends BaseFindDto,
  FindOneDto extends BaseFindOneDto,
  UpdateDto extends BaseUpdateDto,
  DeleteDto extends BaseDeleteDto
> extends RESTAPIEntityControlerWithoutDto<Entity, EntityDomainService> {
  protected defaultRoutes: string[];
  protected validationPipe: ValidationPipe;

  constructor(
    protected domainEntityService: EntityDomainService,
    protected dto: {
      create?: CreateDto;
      bulkCreate?: BulkCreateDto;
      find?: FindDto;
      findOne?: FindOneDto;
      update?: UpdateDto;
      delete?: DeleteDto;
    },
    defaultRoutes?: string[]
  ) {
    super(domainEntityService, Object.keys(dto).concat(defaultRoutes || []));
    this.validationPipe = new ValidationPipe({ whitelist: true });
  }

  @Post('bulk')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async bulkCreate(@Body() body: BulkCreateDto, ..._args: unknown[]): Promise<Entity[]> {
    this.checkRoute('bulkCreate');
    return await this.domainEntityService.bulkCreate(
      await this.validationPipe.transform(body, {
        metatype: (this.dto.bulkCreate as unknown as Type) || GenericObjectClass,
        type: 'body'
      })
    );
  }

  @Post()
  async create(
    @Body()
    body: CreateDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._args: unknown[]
  ): Promise<Entity> {
    this.checkRoute('create');
    return await this.domainEntityService.create(
      await this.validationPipe.transform(body, {
        metatype: (this.dto.create as unknown as Type) || GenericObjectClass,
        type: 'body'
      })
    );
  }

  @Delete()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(@Body() body: DeleteDto, ..._args: unknown[]): Promise<DeleteResult> {
    this.checkRoute('delete');
    return await this.domainEntityService.delete(
      await this.validationPipe.transform(body, {
        metatype: (this.dto.delete as unknown as Type) || BaseDeleteDto,
        type: 'body'
      })
    );
  }

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(@Query() query: FindDto, ..._args: unknown[]): Promise<FindResults<Entity> | void> {
    this.checkRoute('find');
    return await this.domainEntityService.find(
      await this.validationPipe.transform(query, {
        metatype: (this.dto.find as unknown as Type) || BaseFindDto,
        type: 'query'
      })
    );
  }

  @Get('/item/:id')
  async findOne(
    @Param() id: number | string,
    @Query() query: FindOneDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ..._args: unknown[]
  ): Promise<Entity | null | void> {
    this.checkRoute('findOne');
    let filters = query.filters;
    if (!filters) {
      filters = {};
    }
    filters.id = id;
    return await this.domainEntityService.findOne(
      await this.validationPipe.transform(
        { ...query, filters },
        {
          metatype: (this.dto.findOne as unknown as Type) || BaseFindOneDto,
          type: 'query'
        }
      )
    );
  }

  @Patch()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(@Body() body: UpdateDto, ..._args: unknown[]): Promise<UpdateResult<Entity>> {
    this.checkRoute('update');
    const validBody = await this.validationPipe.transform(body, {
      metatype: (this.dto.update as unknown as Type) || BaseUpdateDto,
      type: 'body'
    });
    return this.domainEntityService.update(validBody.data, { filters: validBody.filters });
  }
}