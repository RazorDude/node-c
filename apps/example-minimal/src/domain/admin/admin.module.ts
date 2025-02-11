import { Global, Module } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import * as FolderData from './services';

const { modules, services } = loadDynamicModules(FolderData);
const actualServices = services || [];

@Global()
@Module({
  imports: [...(modules || [])],
  providers: [...actualServices],
  exports: [...actualServices]
})
export class DomainAdminMModule {}
