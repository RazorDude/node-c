import { TransformFnParams } from 'class-transformer';

export function dtoTransformBoolean(params: TransformFnParams): boolean {
  return (
    typeof params.value !== 'undefined' &&
    (params.value === 'true' || params.value === true)
  );
}

export function dtoTransformNumber(
  params: TransformFnParams
): number | undefined {
  const { value } = params;
  if (typeof value === 'undefined') {
    return undefined;
  }
  const numberValue = Number.parseFloat(value);
  if (Number.isNaN(numberValue)) {
    return undefined;
  }
  return numberValue;
}

export function dtoTransformRecordToMap(
  params: TransformFnParams
): Map<string, unknown> | undefined {
  const { value } = params;
  if (
    typeof value === 'undefined' ||
    value === null ||
    value instanceof Date ||
    Array.isArray(value)
  ) {
    return value;
  }
  const transformedValue = new Map<string, unknown>();
  for (const fieldName in value) {
    transformedValue.set(fieldName, value[fieldName]);
  }
  return transformedValue;
}
