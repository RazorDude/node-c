import { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';

import { GenericObject, HttpMethod } from '../../definitions';

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
    headers: AxiosHeaders;
    status: number;
  };
  hasError: boolean;
  statusCode: number;
}
