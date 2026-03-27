import { Request } from 'express';

export interface RequestWithLocals<User> extends Request {
  locals?: {
    isAnonymous?: boolean;
    isApiKeyRoute?: boolean;
    user?: User;
    [fieldName: string]: unknown;
  };
  rawBody?: string;
}
