import crypto from 'crypto';

import axios, { AxiosHeaders } from 'axios';
import qs from 'qs';

import { HTTPRequestData, HTTPRequestResponseData } from './httpRequest.definitions';

import { ApplicationError, GenericObject, HttpMethod } from '../../definitions';

export const httpRequest = async <ResponseData = unknown>(
  url: string,
  data: HTTPRequestData
): Promise<HTTPRequestResponseData<ResponseData>> => {
  const { apiKey, apiSecret, apiSecretHashingAlgorithm, body, query } = data;
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
  // apiKey authorization
  if (apiKey) {
    headers.Authorization = `ApiKey ${apiKey}`;
    // encoding of the request payload via an apiSecret and an asymmetric cryptographic algorithm
    if (apiSecret && apiSecretHashingAlgorithm) {
      let signatureContent: string | undefined;
      if (method === HttpMethod.GET) {
        signatureContent = qs.stringify(requestConfig.params || {});
      } else {
        if (requestConfig.data) {
          if (typeof requestConfig.data === 'object') {
            signatureContent = JSON.stringify(requestConfig.data);
          } else if (typeof requestConfig.data === 'string') {
            signatureContent = requestConfig.data;
          } else if ('toString' in requestConfig.data) {
            signatureContent = requestConfig.data.toString();
          }
        }
      }
      if (!signatureContent?.length) {
        signatureContent = url;
      }
      headers.Authorization += ` ${crypto.createHmac(apiSecretHashingAlgorithm, apiSecret).update(signatureContent).digest('hex')}`;
    }
  }
  requestConfig.headers = headers as AxiosHeaders;
  const response = await axios(requestConfig);
  const { status } = response;
  const hasError = status >= 400;
  const usefulResponse = {
    body: response.data,
    headers: response.headers as AxiosHeaders,
    status
  };
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
