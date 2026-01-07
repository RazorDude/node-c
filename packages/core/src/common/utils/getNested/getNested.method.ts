import { GetNestedOptions } from './getNested.definitions';

import { GenericObject } from '../../definitions';

/**
 * Extracts a value from a deeply nested object, for example foo.bar.0.baz from {foo: {bar: [{baz: 'test'}]}}.
 * @param parent (required) - The object to retrieve the value from.
 * @param field (required) - The path to the field.
 * @param options (optional) - Method executiom options, such as arrayItemsShouldBeUnique.
 * @returns The decoded object or value.
 */
export function getNested<ReturnData = unknown>(
  parent: unknown | unknown[],
  field: string,
  options?: GetNestedOptions
): { paths: string[]; unifiedValue?: ReturnData | ReturnData[]; values: (ReturnData | undefined)[] } {
  if (typeof parent !== 'object' || parent === null || !field.length) {
    return { paths: [field], values: [] };
  }
  const { arrayItemsShouldBeUnique, removeNestedFieldEscapeSign } = options || {};
  const fieldData = field.split('.');
  const fieldDataLength = fieldData.length;
  const paths: string[] = [];
  const values: (ReturnData | undefined)[] = [];
  let currentElement = parent;
  let currentPath = '';
  for (let i = 0; i < fieldDataLength; i++) {
    let innerElementName = fieldData[i];
    // logic for handling Sequelize-style $foo.bar$ - should be treated as a single element
    if (innerElementName.charAt(0) === '$') {
      let closingBracketFound = false,
        closingBracketIndex = i + 1;
      while (closingBracketIndex < fieldDataLength) {
        const element = fieldData[closingBracketIndex];
        // false alarm - there's another $ opening before the current one closed - so the current one must be just a variable name, not a bracket
        if (element.charAt(0) === '$') {
          break;
        }
        // found it !
        if (element.charAt(element.length - 1) === '$') {
          closingBracketFound = true;
          break;
        }
        closingBracketIndex++;
      }
      if (closingBracketFound) {
        for (let j = i + 1; j <= closingBracketIndex; j++) {
          innerElementName += `.${fieldData[j]}`;
        }
        i = closingBracketIndex;
        if (removeNestedFieldEscapeSign) {
          innerElementName = innerElementName.replace(/^\$/, '').replace(/\$$/, '');
        }
      }
    }
    const nextElement = (currentElement as GenericObject)[innerElementName];
    currentPath += `${currentPath.length ? '.' : ''}${innerElementName}`;
    if (typeof nextElement === 'undefined') {
      paths.push(currentPath);
      break;
    }
    // if the next element is an array, prepare to return an array of the inner items
    if (nextElement instanceof Array) {
      // if this is the last item, just return the array
      if (i === fieldDataLength - 1) {
        paths.push(currentPath);
        values.push(nextElement as ReturnData);
        break;
      }
      // if the next item is not an index, recursively call self for each item of the array
      if (isNaN(parseInt(fieldData[i + 1], 10))) {
        let innerPath = '';
        for (let j = i + 1; j < fieldDataLength; j++) {
          innerPath += `${fieldData[j]}${j < fieldDataLength - 1 ? '.' : ''}`;
        }
        nextElement.forEach(item => {
          const { paths: innerPaths, values: innerValue } = getNested(item, innerPath, options);
          if (typeof innerValue === 'undefined') {
            return;
          }
          // flatten inner arrays
          innerValue.forEach((innerValueItem, innerValueItemIndex) => {
            if (
              !arrayItemsShouldBeUnique ||
              (arrayItemsShouldBeUnique && values.indexOf(innerValueItem as ReturnData) === -1)
            ) {
              paths.push(`${currentPath}.${innerValueItemIndex}.${innerPaths[innerValueItemIndex]}`);
              values.push(innerValueItem as ReturnData);
            }
          });
        });
        break;
      }
    }
    currentElement = nextElement as GenericObject;
    if (i === fieldDataLength - 1) {
      paths.push(currentPath);
      values.push(currentElement as ReturnData);
    }
  }
  let unifiedValue = undefined;
  if (paths.length > 1 || values.length > 1) {
    unifiedValue = values;
  } else {
    unifiedValue = values[0];
  }
  return { paths, unifiedValue: unifiedValue as ReturnData | ReturnData[], values };
}
