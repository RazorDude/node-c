// rewrite-validation-options.decorator.ts
import {
  ArgumentMetadata,
  CustomDecorator,
  Injectable,
  SetMetadata,
  Type,
  ValidationPipe,
  type ValidationPipeOptions
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ValidatorOptions } from 'class-validator';

export const REWRITE_VALIDATION_OPTIONS = 'rewrite_validation_options';

export function RewriteValidationOptions(
  options: ValidatorOptions
): CustomDecorator<string> {
  return SetMetadata(REWRITE_VALIDATION_OPTIONS, options);
}

@Injectable()
export class UpdatableValidationPipe extends ValidationPipe {
  protected readonly defaultValidatorOptions: ValidatorOptions;

  constructor(
    protected readonly reflector: Reflector,
    globalOptions: ValidationPipeOptions = {}
  ) {
    super(globalOptions);
    // Store only class-validator relevant options
    this.defaultValidatorOptions = {
      whitelist: globalOptions.whitelist,
      forbidNonWhitelisted: globalOptions.forbidNonWhitelisted,
      skipMissingProperties: globalOptions.skipMissingProperties,
      forbidUnknownValues: globalOptions.forbidUnknownValues
    };
  }

  async transform(
    value: unknown,
    metadata: ArgumentMetadata
  ): Promise<unknown> {
    const overrideOptions = this.reflector.get<ValidatorOptions>(
      REWRITE_VALIDATION_OPTIONS,
      metadata.metatype as Type<unknown>
    );
    if (overrideOptions) {
      const originalOptions = { ...this.validatorOptions };
      this.validatorOptions = {
        ...this.defaultValidatorOptions,
        ...overrideOptions
      };
      try {
        const result = await super.transform(value, metadata);
        this.validatorOptions = originalOptions;
        return result;
      } catch (err) {
        this.validatorOptions = originalOptions;
        throw err;
      }
    }
    return super.transform(value, metadata);
  }
}
