export const AccessControlContext = (moduleName: string, resourceContext: string) => {
  console.log(moduleName, resourceContext);
  return (target: object, propertyKey: string): void => {
    console.log(target, propertyKey);
  };
};

export const AccessControlResource = (resource: string) => {
  console.log(resource);
  return (target: object, propertyKey: string): void => {
    console.log(target, propertyKey);
  };
};
