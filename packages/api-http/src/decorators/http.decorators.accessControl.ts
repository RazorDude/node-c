import { Reflector } from '@nestjs/core';
import { GenericObject } from '@node-c/core';

export const AccessControlContext = Reflector.createDecorator<
  string | { context: string; resourceMap: GenericObject<string> }
>();

export const AccessControlResource = Reflector.createDecorator<string>();
