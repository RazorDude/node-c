import { Request } from 'express';

export interface RequestWithLocals<User> extends Request {
  locals?: {
    isAnonymous?: boolean;
    user?: User;
    [fieldName: string]: unknown;
  };
  rawBody?: string;
}
