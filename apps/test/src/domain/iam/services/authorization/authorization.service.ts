import { Injectable } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService as BaseAuthorizationService } from '@node-c/domain-iam';

import { IAMTokenManagerService } from '../tokenManager';

@Injectable()
export class IAMAuthorizationService extends BaseAuthorizationService {
  constructor(logger: LoggerService, tokenManager: IAMTokenManagerService) {
    super(logger, tokenManager);
  }
}
