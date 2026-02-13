import { DynamicModule, Module } from '@nestjs/common';

import { ClickHouseDBModule } from '@node-c/data-clickhouse';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class DataAuditModule extends ClickHouseDBModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: DataAuditModule,
      moduleName: Constants.DATA_AUDIT_MODULE_NAME
    });
  }
}
