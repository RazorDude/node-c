import { Reflector } from '@nestjs/core';

import { AccessControlContextValue } from './http.decorators.accessControl.definitions.js';

export const AccessControlContext =
  Reflector.createDecorator<AccessControlContextValue>();

export const AccessControlResource = Reflector.createDecorator<string>();
