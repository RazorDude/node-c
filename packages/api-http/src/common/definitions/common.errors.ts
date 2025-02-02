import { GenericObject } from '@node-c/core';

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
