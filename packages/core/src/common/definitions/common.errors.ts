import { GenericObject } from './common.definitions';

export class ApplicationError implements Error {
  data?: { errorCode?: number } | GenericObject;
  message: string;
  name: string;

  constructor(message: string, data?: GenericObject) {
    this.message = message;
    this.name = 'ApplicationError';
    this.data = data || {};
  }
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
