import { Injectable } from '@nestjs/common';

// biome-ignore lint/style/useImportType: DI.
import { LoggerService } from '@node-c/core';
import { IAMAuthorizationService } from '@node-c/domain-iam';

// biome-ignore lint/style/useImportType: DI.
import { DomainCoursePlatformStandaloneTokenManagerService } from '../tokenManager/tokenManager.service.js';

@Injectable()
export class DomainCoursePlatformStandaloneAuthorizationService extends IAMAuthorizationService {
  constructor(
    logger: LoggerService,
    tokenManager: DomainCoursePlatformStandaloneTokenManagerService
  ) {
    super(logger, tokenManager);
  }
}
