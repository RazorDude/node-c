import { GetNestedOptions } from './getNested.interfaces';

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
): ReturnData | undefined {
  if (typeof parent !== 'object' || parent === null || !field.length) {
    return undefined;
  }
  const { arrayItemsShouldBeUnique, removeNestedFieldEscapeSign } = options || {};
  const fieldData = field.split('.');
  const fieldDataLength = fieldData.length;
  let currentElement = parent;
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
    if (typeof nextElement === 'undefined') {
      return undefined;
    }
    // if the next element is an array, prepare to return an array of the inner items
    if (nextElement instanceof Array) {
      // if this is the last item, just return the array
      if (i === fieldDataLength - 1) {
        return nextElement as ReturnData;
      }
      // if the next item is not an index, recursively call self for each item of the array
      if (isNaN(parseInt(fieldData[i + 1], 10))) {
        currentElement = [];
        let innerPath = '';
        for (let j = i + 1; j < fieldDataLength; j++) {
          innerPath += `${fieldData[j]}${j < fieldDataLength - 1 ? '.' : ''}`;
        }
        nextElement.forEach(item => {
          const innerValue = getNested(item, innerPath);
          if (typeof innerValue !== 'undefined') {
            // if the innerValue is an array too, merge it with the currentElement - this way we can have nested arrays without indexes
            if (innerValue instanceof Array) {
              innerValue.forEach(innerValueItem => {
                if (
                  !arrayItemsShouldBeUnique ||
                  (arrayItemsShouldBeUnique && (currentElement as unknown[]).indexOf(innerValueItem) === -1)
                ) {
                  (currentElement as unknown[]).push(innerValueItem);
                }
              });
              return;
            }
            if (
              !arrayItemsShouldBeUnique ||
              (arrayItemsShouldBeUnique && (currentElement as unknown[]).indexOf(innerValue) === -1)
            ) {
              (currentElement as unknown[]).push(innerValue);
            }
          }
        });
        return currentElement as ReturnData;
      }
    }
    currentElement = nextElement as GenericObject;
  }
  return currentElement as ReturnData;
}
