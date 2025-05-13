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

import { HTTPAuthorizationInterceptor, HTTPErrorInterceptor } from '@node-c/api-http';

import {
  DomainBulkCreateResult,
  DomainCreateResult,
  DomainDeleteOptions,
  DomainDeleteResult,
  DomainEntityService,
  DomainEntityServiceDefaultData,
  DomainFindOneOptions,
  DomainFindOneResult,
  DomainFindOptions,
  DomainFindResult,
  DomainUpdateResult,
  PersistanceEntityService
} from '@node-c/core';

import {
  BulkCreateDto as BaseBulkCreateDto,
  CreateDto as BaseCreateDto,
  DeleteDto as BaseDeleteDto,
  FindDto as BaseFindDto,
  FindOneDto as BaseFindOneDto,
  UpdateDto as BaseUpdateDto
} from './dto';
import {
  BulkCreateBody,
  BulkCreateOptions,
  CreateBody,
  CreateOptions,
  UpdateBody,
  UpdateOptions
} from './rest.entity.controller.definitions';

// These types and interfaces have to be here to avoid circular dependencies.
export type DefaultDomainEntityService<Entity> = DomainEntityService<
  Entity,
  PersistanceEntityService<Entity>,
  DomainEntityServiceDefaultData<Entity>,
  Record<string, PersistanceEntityService<Partial<Entity>>>
>;

export interface DefaultDtos<Entity> {
  BulkCreate: BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
  Create: BaseCreateDto<Entity, CreateOptions<Entity>>;
  Delete: BaseDeleteDto<DomainDeleteOptions>;
  Find: BaseFindDto<DomainFindOptions>;
  FindOne: BaseFindOneDto<DomainFindOneOptions>;
  Update: BaseUpdateDto<Entity, UpdateOptions<Entity>>;
}

// TODO: a middleware for converting string booleans to booleans
@UseInterceptors(HTTPAuthorizationInterceptor, HTTPErrorInterceptor)
export class RESTAPIEntityControlerWithoutDto<Entity, EntityDomainService extends DefaultDomainEntityService<Entity>> {
  inUseDefaultRoutes: { [handlerName: string]: boolean };

  constructor(
    // eslint-disable-next-line no-unused-vars
    protected domainEntityService: EntityDomainService,
    // eslint-disable-next-line no-unused-vars
    protected defaultRouteMethods?: string[]
  ) {
    this.refreshDefaultRoutes();
  }

  protected checkRoute(handlerName: string): void {
    if (!this.inUseDefaultRoutes || !this.inUseDefaultRoutes[handlerName]) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  public bulkCreate(_body: BulkCreateBody<Entity>, ..._args: unknown[]): Promise<DomainBulkCreateResult<Entity> | void>;
  @Post('bulk')
  async bulkCreate(@Body() body: BulkCreateBody<Entity>): Promise<DomainBulkCreateResult<Entity>> {
    this.checkRoute('bulkCreate');
    const { data, ...options } = body;
    return await this.domainEntityService.bulkCreate(data, options);
  }

  public create(_body: CreateBody<Entity>, ..._args: unknown[]): Promise<DomainCreateResult<Entity> | void>;
  @Post()
  async create(@Body() body: CreateBody<Entity>): Promise<DomainCreateResult<Entity>> {
    this.checkRoute('create');
    const { data, ...options } = body;
    return await this.domainEntityService.create(data, options);
  }

  public delete(_body: DomainDeleteOptions, ..._args: unknown[]): Promise<DomainDeleteResult<Entity> | void>;
  @Delete()
  async delete(@Body() body: DomainDeleteOptions): Promise<DomainDeleteResult<Entity>> {
    this.checkRoute('delete');
    return await this.domainEntityService.delete(body);
  }

  public find(_query: DomainFindOptions, ..._args: unknown[]): Promise<DomainFindResult<Entity> | void>;
  @Get()
  async find(@Query() query: DomainFindOptions): Promise<DomainFindResult<Entity> | void> {
    this.checkRoute('find');
    return await this.domainEntityService.find(query);
  }

  public findOne(
    _id: number | string,
    _query: DomainFindOneOptions,
    ..._args: unknown[]
  ): Promise<DomainFindOneResult<Entity> | void>;
  @Get('/item/:id')
  async findOne(
    @Param() id: number | string,
    @Query() query: DomainFindOneOptions
  ): Promise<DomainFindOneResult<Entity> | void> {
    this.checkRoute('findOne');
    let filters = query.filters;
    if (!filters) {
      filters = {};
      query.filters = filters;
    }
    filters.id = id;
    return await this.domainEntityService.findOne(query);
  }

  refreshDefaultRoutes(newDefaultRoutes?: string[]): void {
    const defaultRouteMethods = newDefaultRoutes || this.defaultRouteMethods;
    this.inUseDefaultRoutes = {};
    if (defaultRouteMethods instanceof Array) {
      defaultRouteMethods.forEach(item => (this.inUseDefaultRoutes[item] = true));
    }
  }

  public update(_body: UpdateBody<Entity>, ..._args: unknown[]): Promise<DomainUpdateResult<Entity> | void>;
  @Patch()
  async update(@Body() body: UpdateBody<Entity>): Promise<DomainUpdateResult<Entity>> {
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
  EntityDomainService extends DefaultDomainEntityService<Entity>,
  Dto extends DefaultDtos<Entity> = DefaultDtos<Entity>
> extends RESTAPIEntityControlerWithoutDto<Entity, EntityDomainService> {
  protected defaultRouteMethods: string[];
  protected validationPipe: ValidationPipe;

  constructor(
    protected domainEntityService: EntityDomainService,
    protected dto: {
      bulkCreate?: Dto['BulkCreate'];
      create?: Dto['Create'];
      delete?: Dto['Delete'];
      find?: Dto['Find'];
      findOne?: Dto['FindOne'];
      update?: Dto['Update'];
    },
    defaultRouteMethods?: string[]
  ) {
    super(domainEntityService, Object.keys(dto || {}).concat(defaultRouteMethods || []));
    // const finalDto: typeof dto = {};
    // finalDto.bulkCreate = dto?.bulkCreate || BaseBulkCreateDto<Entity, BulkCreateOptions<Entity>>;
    this.validationPipe = new ValidationPipe({ whitelist: true });
  }

  @Post('bulk')
  async bulkCreate(
    @Body() body: Dto['BulkCreate'],
    ...args: unknown[]
  ): Promise<DomainBulkCreateResult<Entity> | void> {
    return await super.bulkCreate.apply(this, [
      await this.validationPipe.transform(body, {
        metatype: this.dto.bulkCreate as unknown as Type,
        type: 'body'
      }),
      ...(args || [])
    ]);
  }

  @Post()
  async create(
    @Body()
    body: Dto['Create'],
    ...args: unknown[]
  ): Promise<DomainCreateResult<Entity> | void> {
    return await super.create.apply(this, [
      await this.validationPipe.transform(body, {
        metatype: this.dto.create as unknown as Type,
        type: 'body'
      }),
      ...(args || [])
    ]);
  }

  @Delete()
  async delete(@Body() body: Dto['Delete'], ...args: unknown[]): Promise<DomainDeleteResult<Entity> | void> {
    return await super.delete.apply(this, [
      await this.validationPipe.transform(body, {
        metatype: this.dto.delete as unknown as Type,
        type: 'body'
      }),
      ...(args || [])
    ]);
  }

  @Get()
  async find(@Query() query: Dto['Find'], ...args: unknown[]): Promise<DomainFindResult<Entity> | void> {
    return await super.find.apply(this, [
      await this.validationPipe.transform(query, {
        metatype: this.dto.find as unknown as Type,
        type: 'query'
      }),
      ...(args || [])
    ]);
  }

  @Get('/item/:id')
  async findOne(
    @Param() id: number | string,
    @Query() query: Dto['FindOne'],
    ...args: unknown[]
  ): Promise<DomainFindOneResult<Entity> | void> {
    return await super.findOne.apply(this, [
      id,
      await this.validationPipe.transform(query, {
        metatype: this.dto.findOne as unknown as Type,
        type: 'query'
      }),
      ...(args || [])
    ]);
  }

  static getDefaultDtos<EntityForDtos>(): {
    bulkCreate: DefaultDtos<EntityForDtos>['BulkCreate'];
    find: DefaultDtos<EntityForDtos>['Find'];
    findOne: DefaultDtos<EntityForDtos>['FindOne'];
  } {
    return {
      bulkCreate: BaseBulkCreateDto as unknown as DefaultDtos<EntityForDtos>['BulkCreate'],
      find: BaseFindDto as unknown as DefaultDtos<EntityForDtos>['Find'],
      findOne: BaseFindDto as unknown as DefaultDtos<EntityForDtos>['FindOne']
      // create: BaseCreateDto,
      // delete: BaseDeleteDto,
      // find: BaseFindDto,
      // findOne: BaseFindOneDto,
      // update: BaseUpdateDto
    };
  }

  @Patch()
  async update(@Body() body: Dto['Update'], ...args: unknown[]): Promise<DomainUpdateResult<Entity> | void> {
    return await super.update.apply(this, [
      await this.validationPipe.transform(body, {
        metatype: this.dto.update as unknown as Type,
        type: 'body'
      }),
      ...(args || [])
    ]);
  }
}
