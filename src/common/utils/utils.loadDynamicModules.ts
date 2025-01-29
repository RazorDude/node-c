import { ClassProvider, DynamicModule, Provider } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { GenericObject } from '../definitions';

export type ProviderWithInjectionToken = Provider & {
  injectionToken?: string;
};

export const loadDynamicModules = (
  folderData: GenericObject<unknown>
): { controllers?: Provider[]; entities?: EntityClassOrSchema[]; modules?: DynamicModule[]; services?: Provider[] } => {
  const controllers: Provider[] = [];
  const entities: EntityClassOrSchema[] = [];
  const modules: DynamicModule[] = [];
  const services: Provider[] = [];
  for (const key in folderData) {
    const actualKey = key as keyof typeof folderData;
    if (key.match(/^base(.+)?$/)) {
      continue;
    }
    if (key.match(/[cC]ontroller$/)) {
      const FolderDataItem = folderData[actualKey] as ProviderWithInjectionToken;
      if (FolderDataItem.injectionToken) {
        controllers.push({
          provide: FolderDataItem.injectionToken,
          useClass: FolderDataItem as ClassProvider['useClass']
        });
        continue;
      }
      controllers.push(FolderDataItem);
      continue;
    }
    if (key.match(/[eE]ntity$/)) {
      entities.push(folderData[actualKey] as EntityClassOrSchema);
      continue;
    }
    if (key.match(/[mM]odule$/)) {
      modules.push(folderData[actualKey] as unknown as DynamicModule);
      continue;
    }
    if (key.match(/[sS]ervice$/)) {
      const FolderDataItem = folderData[actualKey] as ProviderWithInjectionToken;
      if (FolderDataItem.injectionToken) {
        services.push({
          provide: FolderDataItem.injectionToken,
          useClass: FolderDataItem as ClassProvider['useClass']
        });
        continue;
      }
      services.push(FolderDataItem);
      continue;
    }
  }
  return {
    controllers: controllers.length ? controllers : undefined,
    entities: entities.length ? entities : undefined,
    modules: modules.length ? modules : undefined,
    services: services.length ? services : undefined
  };
};
