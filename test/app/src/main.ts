import { NestModule } from '@nestjs/common';
import { NodeCApp } from '@node-c/app';

import { AppModule } from './app.module';

(async function () {
  await NodeCApp.start([AppModule] as unknown as NestModule[], {
    loadConfigOptions: AppModule.configProviderModuleRegisterOptions
  });
})().then(
  () => console.info('App started.'),
  err => {
    console.error(err);
    process.exit(1);
  }
);
