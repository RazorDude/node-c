import { ClassProvider, DynamicModule, Provider } from '@nestjs/common';

import { GenericObject } from '../../definitions';

export type ProviderWithInjectionToken = Provider & {
  injectionToken?: string;
};

export const loadDynamicModules = (
  folderData: GenericObject<unknown>,
  options?: { moduleRegisterOptions?: unknown; registerOptionsPerModule?: GenericObject }
): { controllers?: Provider[]; entities?: unknown[]; modules?: DynamicModule[]; services?: Provider[] } => {
  const { moduleRegisterOptions, registerOptionsPerModule } = options || {};
  const controllers: Provider[] = [];
  const entities: unknown[] = [];
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
        // continue;
      }
      controllers.push(FolderDataItem);
      continue;
    }
    if (key.match(/[eE]ntity$/)) {
      entities.push(folderData[actualKey]);
      continue;
    }
    if (key.match(/[mM]odule$/)) {
      const moduleClass = folderData[actualKey] as DynamicModule & {
        register?: (..._args: unknown[]) => DynamicModule;
      };
      modules.push(
        moduleClass.register
          ? moduleClass.register(registerOptionsPerModule?.[key] || moduleRegisterOptions)
          : moduleClass
      );
      continue;
    }
    if (key.match(/[sS]ervice$/)) {
      const FolderDataItem = folderData[actualKey] as ProviderWithInjectionToken;
      if (FolderDataItem.injectionToken) {
        services.push({
          provide: FolderDataItem.injectionToken,
          useClass: FolderDataItem as ClassProvider['useClass']
        });
        // continue;
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
