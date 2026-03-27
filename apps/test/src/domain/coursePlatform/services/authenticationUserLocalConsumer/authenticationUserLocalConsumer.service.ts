import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationUserLocalConsumerService } from '@node-c/domain-iam';

import {
  CoursePlatformAuthenticationUserLocalConsumerCompleteData,
  CoursePlatformAuthenticationUserLocalConsumerCompleteOptions,
  CoursePlatformAuthenticationUserLocalConsumerCompleteResult,
  CoursePlatformAuthenticationUserLocalConsumerUserFields
} from './authenticationUserLocalConsumer.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';

/*
 * User & Password Auth via another Node-C service that acts as the provider.
 * User data from: provider
 * Internal tokens from: provider
 * External tokens from: provider
 * Authentication happens in: provider
 */
@Injectable()
export class CoursePlatformAuthenticationUserLocalConsumerService extends IAMAuthenticationUserLocalConsumerService<
  CoursePlatformAuthenticationUserLocalConsumerUserFields,
  CoursePlatformAuthenticationUserLocalConsumerUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_CONSUMER_SERVICE_NAME);
  }

  async complete(
    data: CoursePlatformAuthenticationUserLocalConsumerCompleteData,
    options: CoursePlatformAuthenticationUserLocalConsumerCompleteOptions<CoursePlatformAuthenticationUserLocalConsumerUserFields>
  ): Promise<CoursePlatformAuthenticationUserLocalConsumerCompleteResult> {
    const result = await super.complete(data, options);
    await this.userLoginLogsService.create({
      datetime: new Date()
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, ''),
      userId: options.context.id
    });
    return result;
  }
}
