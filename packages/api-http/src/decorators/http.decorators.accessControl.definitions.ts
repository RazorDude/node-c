import { GenericObject } from '@node-c/core';

export type AccessControlContextValue =
  | string
  | { context: string; resourceMap: GenericObject<string> };
