import { Inject, Injectable } from '@nestjs/common';

import {
  AppConfigDomainIAMAuthenticationStep,
  ApplicationError,
  ConfigProviderService,
  Constants as CoreConstants,
  LoggerService
} from '@node-c/core';
import {
  IAMAuthenticationManagerAuthenticateOptions,
  IAMAuthenticationManagerAuthenticateReturnData,
  IAMAuthenticationManagerService,
  IAMAuthenticationPassthroughCompleteData
} from '@node-c/domain-iam';

import ld from 'lodash';

import { Constants } from '../../../../common/definitions/common.constants.js';
import { DataCacheAuthUserStepDataItemsEntityService } from '../../../../data/cacheAuth/entities/userStepDataItems/userStepDataItems.service.js';
import { DataDBUsersDataEntityServiceData } from '../../../../data/db/entities/users/users.definitions.js';
import { DataDBUser } from '../../../../data/db/entities/users/users.entity.js';

import { DomainCoursePlatformStandaloneAuthenticationOktaService } from '../authenticationOkta/authenticationOkta.service.js';
import { CoursePlatformStandaloneAuthenticationPassthroughConsumerService } from '../authenticationPassthroughConsumer/authenticationPassthroughConsumer.service.js';
import { DomainCoursePlatformStandaloneAuthenticationUserLocalService } from '../authenticationUserLocal/authenticationUserLocal.service.js';
import { DomainCoursePlatformStandaloneTokenManagerService } from '../tokenManager/tokenManager.service.js';
import { DomainCoursePlatformStandaloneUsersServiceData } from '../users/users.definitions.js';
import { DomainCoursePlatformStandaloneUsersService } from '../users/users.service.js';

// TODO: inject passthrough consumer after the standalone authentication finishes
@Injectable()
export class DomainCoursePlatformStandaloneAuthenticationManagerService extends IAMAuthenticationManagerService<
  DataDBUser,
  DomainCoursePlatformStandaloneUsersServiceData<DataDBUser>,
  DataDBUsersDataEntityServiceData<DataDBUser>
> {
  constructor(
    protected authenticationOktaService: DomainCoursePlatformStandaloneAuthenticationOktaService,
    protected authenticationPassthroughConsumerService: CoursePlatformStandaloneAuthenticationPassthroughConsumerService,
    protected authenticationUserLocalService: DomainCoursePlatformStandaloneAuthenticationUserLocalService,
    configProvider: ConfigProviderService,
    protected dataUserStepDataItemsService: DataCacheAuthUserStepDataItemsEntityService,
    domainUsersEntityService: DomainCoursePlatformStandaloneUsersService,
    logger: LoggerService,
    @Inject(CoreConstants.DOMAIN_MODULE_NAME)
    moduleName: string,
    tokenManager: DomainCoursePlatformStandaloneTokenManagerService
  ) {
    super(
      {
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME]: authenticationOktaService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME]:
          authenticationPassthroughConsumerService,
        [Constants.DOMAIN_COURSE_PLATFORM_AUTH_USER_LOCAL_SERVICE_NAME]: authenticationUserLocalService
      },
      configProvider,
      logger,
      moduleName,
      dataUserStepDataItemsService,
      domainUsersEntityService,
      tokenManager
    );
  }

  async authenticate<AuthData = IAMAuthenticationPassthroughCompleteData>(
    options: IAMAuthenticationManagerAuthenticateOptions<AuthData>
  ): Promise<IAMAuthenticationManagerAuthenticateReturnData<DataDBUser>> {
    const authenticateResult = await super.authenticate(options);
    if (
      (options.step === AppConfigDomainIAMAuthenticationStep.Initiate &&
        options.auth.type === Constants.DOMAIN_COURSE_PLATFORM_AUTH_OKTA_SERVICE_NAME) ||
      options.auth.type === Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME
    ) {
      return authenticateResult;
    }
    if ('accessToken' in authenticateResult && authenticateResult.accessToken && authenticateResult.user) {
      // Here, the local tokens are intentionally set as "external", so that they're used as such by the
      // passthrough provider. It'll then decode them and find the user based on the idToken data.
      const passthroughResult = await this.authenticate({
        auth: {
          externalAccessToken: authenticateResult.accessToken,
          externalIdToken: authenticateResult.idToken,
          externalRefreshToken: authenticateResult.refreshToken,
          type: Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME
        },
        filters: { email: authenticateResult.user.email },
        mainFilterField: 'email',
        step: AppConfigDomainIAMAuthenticationStep.Complete
      });
      if ('user' in passthroughResult) {
        return { ...passthroughResult, user: ld.merge(authenticateResult.user, passthroughResult.user) };
      }
      throw new ApplicationError(
        `Authentication failed (type ${Constants.DOMAIN_COURSE_PLATFORM_AUTH_PASSTHROUGH_CONSUMER_SERVICE_NAME}).`
      );
    }
    throw new ApplicationError(`Authentication failed (type ${options.auth.type}).`);
  }
}
