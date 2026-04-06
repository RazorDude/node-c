import { Injectable } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import { DomainCoursePlatformFederatedTokenManagerService } from '../tokenManager';

@Injectable()
export class DomainCoursePlatformFederatedAuthorizationService extends IAMAuthorizationService {
  constructor(logger: LoggerService, tokenManager: DomainCoursePlatformFederatedTokenManagerService) {
    super(logger, tokenManager);
  }
}
