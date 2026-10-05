import type { GenericObject } from '@node-c/core';

export enum ErrorCodes {
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_MISSING = 'AUTH_MISSING',
  ROUTE_NOT_ALLOWED = 'ROUTE_NOT_ALLOWED'
}

export class ServerError implements Error {
  data: { statusCode: number } | GenericObject;
  message: string;
  name: string;

  constructor(message: string, data?: GenericObject) {
    this.message = message;
    this.name = 'ServerError';
    this.data = data || {};
  }
}
