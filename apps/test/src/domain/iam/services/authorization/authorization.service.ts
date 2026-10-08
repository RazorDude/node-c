import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

// biome-ignore lint/style/useImportType: DI.
import { DomainIAMTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainIAMAuthorizationService extends IAMAuthorizationService {
  constructor(
    logger: LoggerService,
    tokenManager: DomainIAMTokenManagerService
  ) {
    super(logger, tokenManager);
  }
}
