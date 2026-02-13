import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { GenericObject, HttpMethod } from '../../definitions';

export interface HTTPRequestData {
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
  fullResponse?: Omit<AxiosResponse, 'config' | 'request'>;
  hasError: boolean;
  statusCode: number;
}
