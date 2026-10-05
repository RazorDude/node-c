import { Injectable } from '@nestjs/common';

import type { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import type { DomainIAMTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainIAMAuthorizationService extends IAMAuthorizationService {
  constructor(
    logger: LoggerService,
    tokenManager: DomainIAMTokenManagerService
  ) {
    super(logger, tokenManager);
  }
}
