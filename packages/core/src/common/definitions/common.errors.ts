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
