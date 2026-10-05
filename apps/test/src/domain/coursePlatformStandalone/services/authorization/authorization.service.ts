import { Injectable } from '@nestjs/common';

import type { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import type { DomainCoursePlatformStandaloneTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneAuthorizationService extends IAMAuthorizationService {
  constructor(
    logger: LoggerService,
    tokenManager: DomainCoursePlatformStandaloneTokenManagerService
  ) {
    super(logger, tokenManager);
  }
}
