import { Injectable } from '@nestjs/common';

import type { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import type { DomainCoursePlatformFederatedTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainCoursePlatformFederatedAuthorizationService extends IAMAuthorizationService {
  constructor(
    logger: LoggerService,
    tokenManager: DomainCoursePlatformFederatedTokenManagerService
  ) {
    super(logger, tokenManager);
  }
}
