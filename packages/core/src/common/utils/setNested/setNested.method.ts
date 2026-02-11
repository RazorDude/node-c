import { SetNestedOptions } from './setNested.definitions';

/**
 * Sets a value in a deeply nested object, for example foo.bar.0.baz in {foo: {bar: [{baz: 'test'}]}}.
 * @param parent (required) - The object to set the value in.
 * @param field (required) - The path to the field.
 * @param value (required) - The value to set.
 * @returns boolean true if successful, false if not found
 */
export function setNested(parent: unknown, field: string, value: unknown, options?: SetNestedOptions): boolean {
  const { removeNestedFieldEscapeSign } = options || {};
  const fieldNames = field.split('.');
  if (field === '' || !fieldNames.length) {
    return false;
  }
  let currentParent = parent;
  let finalResult = false;
  const loopEnd = fieldNames.length - 1;
  for (let i = 0; i <= loopEnd; i++) {
    if (currentParent === null) {
      return false;
    }
    let fieldName = fieldNames[i];
    // TODO: setNested for specific indexes
    // if the current parent is an array and the next field path item is not an index - set the value in all of the array's sub-items
    if (currentParent instanceof Array && isNaN(parseInt(fieldName, 10))) {
      let atLeastOnItemSet = false,
        nestedFieldPath = `${fieldName}`;
      for (let j = i + 1; j <= loopEnd; j++) {
        nestedFieldPath += `.${fieldNames[j]}`;
      }
      currentParent.forEach(item => {
        const result = setNested(item, nestedFieldPath, value);
        if (result && !atLeastOnItemSet) {
          atLeastOnItemSet = true;
        }
      });
      return atLeastOnItemSet;
    }
    // logic for handling Sequelize-style $foo.bar$ - should be treated as a single element
    if (fieldName.charAt(0) === '$') {
      let closingBracketFound = false,
        closingBracketIndex = i + 1;
      while (closingBracketIndex <= loopEnd) {
        const element = fieldNames[closingBracketIndex];
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
          fieldName += `.${fieldNames[j]}`;
        }
        if (removeNestedFieldEscapeSign) {
          fieldName = fieldName.replace(/^\$/, '').replace(/\$$/, '');
        }
        if (closingBracketIndex === loopEnd) {
          (currentParent as Record<string, unknown>)[fieldName] = value;
          return true;
        }
        i = closingBracketIndex;
      }
    }
    if (i === loopEnd) {
      (currentParent as Record<string, unknown>)[fieldName] = value;
      finalResult = true;
      break;
    }
    if (typeof (currentParent as Record<string, unknown>)[fieldName] === 'undefined') {
      (currentParent as Record<string, unknown>)[fieldName] = {};
    }
    currentParent = (currentParent as Record<string, unknown>)[fieldName];
  }
  return finalResult;
}
