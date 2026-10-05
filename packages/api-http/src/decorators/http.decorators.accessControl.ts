import { Reflector } from '@nestjs/core';

import type { GenericObject } from '@node-c/core';

export const AccessControlContext = Reflector.createDecorator<
  string | { context: string; resourceMap: GenericObject<string> }
>();

export const AccessControlResource = Reflector.createDecorator<string>();
