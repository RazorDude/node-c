import { ClassProvider, DynamicModule, Provider } from '@nestjs/common';

import { GenericObject } from '../../definitions/common.definitions.js';

const regExps = {
  base: new RegExp(/^base(.+)?$/),
  controllers: new RegExp(/[cC]ontroller$/),
  entities: new RegExp(/[eE]ntity$/),
  modules: new RegExp(/[mM]odule$/),
  services: new RegExp(/[sS]ervice$/)
};

export type ProviderWithInjectionToken = Provider & {
  injectionToken?: string;
};

export const loadDynamicModules = (
  folderData: GenericObject<unknown>,
  options?: {
    moduleRegisterOptions?: unknown;
    registerOptionsPerModule?: GenericObject;
  }
): {
  controllers?: Provider[];
  entities?: unknown[];
  modules?: DynamicModule[];
  services?: Provider[];
} => {
  const { moduleRegisterOptions, registerOptionsPerModule } = options || {};
  const controllers: Provider[] = [];
  const entities: unknown[] = [];
  const modules: DynamicModule[] = [];
  const services: Provider[] = [];
  for (const key in folderData) {
    const actualKey = key as keyof typeof folderData;
    if (key.match(regExps.base)) {
      continue;
    }
    if (key.match(regExps.controllers)) {
      const FolderDataItem = folderData[
        actualKey
      ] as ProviderWithInjectionToken;
      if (FolderDataItem.injectionToken) {
        controllers.push({
          provide: FolderDataItem.injectionToken,
          useClass: FolderDataItem as ClassProvider['useClass']
        });
      }
      controllers.push(FolderDataItem);
      continue;
    }
    if (key.match(regExps.entities)) {
      entities.push(folderData[actualKey]);
      continue;
    }
    if (key.match(regExps.modules)) {
      const moduleClass = folderData[actualKey] as DynamicModule & {
        register?: (..._args: unknown[]) => DynamicModule;
      };
      modules.push(
        moduleClass.register
          ? moduleClass.register(
              registerOptionsPerModule?.[key] || moduleRegisterOptions
            )
          : moduleClass
      );
      continue;
    }
    if (key.match(regExps.services)) {
      const FolderDataItem = folderData[
        actualKey
      ] as ProviderWithInjectionToken;
      if (FolderDataItem.injectionToken) {
        services.push({
          provide: FolderDataItem.injectionToken,
          useClass: FolderDataItem as ClassProvider['useClass']
        });
      }
      services.push(FolderDataItem);
    }
  }
  return {
    controllers: controllers.length > 0 ? controllers : undefined,
    entities: entities.length > 0 ? entities : undefined,
    modules: modules.length > 0 ? modules : undefined,
    services: services.length > 0 ? services : undefined
  };
};
