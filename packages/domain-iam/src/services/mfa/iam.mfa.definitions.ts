export interface IAMMFACompleteData {
  type?: IAMMFAType;
}

export interface IAMMFACompleteOptions<Context> {
  context: Context;
}

export enum IAMMFAType {
  // eslint-disable-next-line no-unused-vars
  Local = 'local'
}

export interface IAMMFACompleteResult {
  valid: boolean;
}

export interface IAMMFAInitiateData {
  type?: IAMMFAType;
}

export interface IAMMFAInitiateOptions<Context> {
  context: Context;
}

export interface IAMMFAInitiateResult {
  valid: boolean;
}
