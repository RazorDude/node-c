import { Inject, Injectable } from '@nestjs/common';

import { ConfigProviderService, Constants as CoreConstants, LoggerService } from '@node-c/core';
import { IAMAuthenticationUserLocalService } from '@node-c/domain-iam';

import {
  CoursePlatformAuthenticationUserLocalCompleteData,
  CoursePlatformAuthenticationUserLocalCompleteOptions,
  CoursePlatformAuthenticationUserLocalCompleteResult,
  CoursePlatformAuthenticationUserLocalUserFields
} from './authenticationUserLocal.definitions';

import { Constants } from '../../../../common/definitions';
import { AuditUserLoginLogsService } from '../../../../data/audit/entities';
/*
 * User & Password authentication as a standalone service. Its output can be used for the Passthrough service.
 */
@Injectable()
export class CoursePlatformAuthenticationUserLocalService extends IAMAuthenticationUserLocalService<
  CoursePlatformAuthenticationUserLocalUserFields,
  CoursePlatformAuthenticationUserLocalUserFields
> {
  constructor(
    configProvider: ConfigProviderService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    // eslint-disable-next-line no-unused-vars
    protected userLoginLogsService: AuditUserLoginLogsService
  ) {
    super(configProvider, logger, moduleName, Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME);
  }

  async complete(
    data: CoursePlatformAuthenticationUserLocalCompleteData,
    options: CoursePlatformAuthenticationUserLocalCompleteOptions<CoursePlatformAuthenticationUserLocalUserFields>
  ): Promise<CoursePlatformAuthenticationUserLocalCompleteResult> {
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
