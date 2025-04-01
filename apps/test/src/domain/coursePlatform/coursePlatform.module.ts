import { Global, Module } from '@nestjs/common';

import { loadDynamicModules } from '@node-c/core';

import * as FolderData from './services';

const { services } = loadDynamicModules(FolderData);

@Global()
@Module({
  providers: [...services!],
  exports: [...services!]
})
export class DomainCoursePlatformModule {}
