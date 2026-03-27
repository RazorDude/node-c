import { Injectable } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { CoursePlatformTokenManagerService } from '../tokenManager';

@Injectable()
export class CoursePlatformAuthorizationService extends BaseAuthorizationService {
  constructor(logger: LoggerService, tokenManager: CoursePlatformTokenManagerService) {
    super(logger, tokenManager);
  }
}
