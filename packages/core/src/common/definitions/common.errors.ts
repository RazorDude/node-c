import { GenericObject } from './common.definitions.js';

export class ApplicationError extends Error {
  data?: { errorCode?: number } | GenericObject;
  message: string;
  name: string;

  constructor(message: string, data?: GenericObject) {
    super(message);
    this.message = message;
    this.name = 'ApplicationError';
    this.data = data || {};
  }
}
