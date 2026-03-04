export const CheckAccess = (options: {
  moduleName: string;
  inputPath: string;
  resource?: string;
  resourceContext?: string;
  userPath: string;
}) => {
  // const { moduleName, inputPath, resource, resourceContext, userPath } = options;
  console.log(options);
  return (target: object, propertyKey: string): void => {
    console.log(target, propertyKey);
  };
};
