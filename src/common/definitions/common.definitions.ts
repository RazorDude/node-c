import { Request } from 'express';

export interface GenericObject<Values = unknown> {
  [fieldName: string]: Values;
}

export class GenericObjectClass<Values = unknown> implements GenericObject<Values> {
  [fieldName: string]: Values;
}

export interface RequestWithLocals<User> extends Request {
  locals?: {
    isAnonymous?: boolean;
    user?: User;
    [fieldName: string]: unknown;
  };
  rawBody?: string;
}
