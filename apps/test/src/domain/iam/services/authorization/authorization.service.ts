import { Injectable } from '@nestjs/common';

import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

import { DomainIAMTokenManagerService } from '../tokenManager';

@Injectable()
export class DomainIAMAuthorizationService extends IAMAuthorizationService {
  constructor(logger: LoggerService, tokenManager: DomainIAMTokenManagerService) {
    super(logger, tokenManager);
  }
}
