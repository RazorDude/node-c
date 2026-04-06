import { Injectable } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import { DomainCoursePlatformStandaloneTokenManagerService } from '../tokenManager';

@Injectable()
export class DomainCoursePlatformStandaloneAuthorizationService extends IAMAuthorizationService {
  constructor(logger: LoggerService, tokenManager: DomainCoursePlatformStandaloneTokenManagerService) {
    super(logger, tokenManager);
  }
}
