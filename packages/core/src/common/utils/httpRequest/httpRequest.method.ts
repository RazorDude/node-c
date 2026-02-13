import axios, { AxiosHeaders } from 'axios';
import ld from 'lodash';

import { HTTPRequestData, HTTPRequestResponseData } from './httpRequest.definitions';

import { ApplicationError, GenericObject, HttpMethod } from '../../definitions';

export const httpRequest = async <ResponseData = unknown>(
  url: string,
  data: HTTPRequestData
): Promise<HTTPRequestResponseData<ResponseData>> => {
  const { body, query } = data;
  const headers: GenericObject<unknown> = { ...(data.headers || {}) };
  const method = data.method || HttpMethod.GET;
  const requestConfig = {
    ...(data.axiosConfig || {}),
    method,
    url
  };
  if (query && method === HttpMethod.GET) {
    requestConfig.params = query;
  } else if (body && method !== HttpMethod.GET) {
    requestConfig.data = body;
  }
  if (data.isJSON) {
    headers['Content-Type'] = 'application/json';
    requestConfig.responseType = 'json';
  } else if (data.isFormData) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  requestConfig.headers = headers as AxiosHeaders;
  const response = await axios(requestConfig);
  const { status } = response;
  const usefulResponse = ld.omit(response, ['config', 'request']);
  const hasError = status >= 400;
  if (hasError && data.throwOnError) {
    throw new ApplicationError(`An httpRequest error with statusCode ${status} has occurred.`, usefulResponse);
  }
  const returnData: HTTPRequestResponseData<ResponseData> = { hasError, statusCode: status };
  if (data.returnFullResponse) {
    returnData.fullResponse = usefulResponse;
  } else if (response.data) {
    returnData.data = response.data;
  }
  return returnData;
};
