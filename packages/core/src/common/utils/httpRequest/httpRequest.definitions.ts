import { AxiosRequestConfig, AxiosResponse, RawAxiosHeaders } from 'axios';

import { HttpMethod } from '../../definitions/common.constants.js';
import { GenericObject } from '../../definitions/common.definitions.js';

export interface HTTPRequestData {
  apiKey?: string;
  apiSecret?: string;
  apiSecretHashingAlgorithm?: string;
  axiosConfig?: Partial<AxiosRequestConfig>;
  body?: GenericObject<unknown>;
  headers?: GenericObject<unknown>;
  isFormData?: boolean;
  isJSON?: boolean;
  method?: HttpMethod;
  query?: GenericObject<unknown>;
  returnFullResponse?: boolean;
  throwOnError?: boolean;
}

export interface HTTPRequestResponseData<Data = unknown> {
  data?: Data;
  fullResponse?: {
    body: Pick<AxiosResponse, 'data'>;
    headers: RawAxiosHeaders;
    status: number;
  };
  hasError: boolean;
  statusCode: number;
}
