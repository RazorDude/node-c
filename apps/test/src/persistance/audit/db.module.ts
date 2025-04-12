import { DynamicModule, Module } from '@nestjs/common';

import { ClickHouseDBModule } from '@node-c/persistance-clickhouse';

import * as FolderData from './entities';

import { Constants } from '../../common/definitions';

@Module({})
export class PersistanceAuditModule extends ClickHouseDBModule {
  static register(): DynamicModule {
    return super.register({
      folderData: FolderData,
      moduleClass: PersistanceAuditModule,
      moduleName: Constants.PERSISTANCE_AUDIT_MODULE_NAME
    });
  }
}
