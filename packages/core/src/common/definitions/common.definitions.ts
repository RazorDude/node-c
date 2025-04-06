export interface GenericObject<Values = unknown> {
  [fieldName: string]: Values;
}

export class GenericObjectClass<Values = unknown> implements GenericObject<Values> {
  [fieldName: string]: Values;
}

export type GenericObjectType<Type> =
  | {
      new (): Type;
    }
  | ((..._args: unknown[]) => unknown);
