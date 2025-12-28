import { strict as assert } from 'assert';

import { getNested } from '../../dist';

describe('getNested', function () {
  it('should execute successfully and return undefined if an undefined parent argument is provided', function () {
    const result = getNested(undefined, 'test');
    assert.strictEqual(result, undefined, `bad value ${result} for the method execution result, expected undefined`);
  });
  it('should execute successfully and return undefined if a null parent argument is provided', function () {
    const result = getNested(null, 'test');
    assert.strictEqual(result, undefined, `bad value ${result} for the method execution result, expected undefined`);
  });
  it('should execute successfully and return undefined if an empty string field argument is provided', function () {
    const result = getNested({}, '');
    assert.strictEqual(result, undefined, `bad value ${result} for the method execution result, expected undefined`);
  });
  it('should execute successfully and return undefined if the field does not exist in the parent at the top level', function () {
    const result = getNested({}, 'foo.bar');
    assert.strictEqual(result, undefined, `bad value ${result} for the method execution result, expected undefined`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent and there are no arrays in the path', function () {
    const result = getNested({ foo: { bar: 'test' } }, 'foo.bar');
    assert.strictEqual(result, 'test', `bad value ${result} for the method execution result, expected ${'test'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, there are arrays in the path and an index is provided', function () {
    const result = getNested(
      { foo: [{ bar: 'test' }, { bar: 'test2' }, { bar: 'test' }, { bar: 'test3' }] },
      'foo.0.bar'
    );
    assert.strictEqual(result, 'test', `bad value ${result} for result, expected ${'test'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, there are arrays in the path, no index is provided and arrayItemsShouldBeUnique is not provided', function () {
    const result = getNested(
      { foo: [{ bar: 'test' }, { bar: 'test2' }, { bar: 'test' }, { bar: 'test3' }, { ab: 'test4' }] },
      'foo.bar'
    );
    assert.strictEqual(result.length, 4, `bad value ${result.length} for result.length, expected ${4}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test', `bad value ${result[2]} for result[2], expected ${'test'}`);
    assert.strictEqual(result[3], 'test3', `bad value ${result[3]} for result[3], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, there are arrays in the path, no index is provided and arrayItemsShouldBeUnique is set to true', function () {
    const result = getNested(
      { foo: [{ bar: 'test' }, { bar: 'test2' }, { bar: 'test' }, { bar: 'test3' }] },
      'foo.bar',
      {
        arrayItemsShouldBeUnique: true
      }
    );
    assert.strictEqual(result.length, 3, `bad value ${result.length} for result.length, expected ${3}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test3', `bad value ${result[2]} for result[2], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $ in the field name and there are no arrays in the path', function () {
    const result = getNested({ foo: { $bar: { q: 'test' } } }, 'foo.$bar.q');
    assert.strictEqual(result, 'test', `bad value ${result} for the method execution result, expected ${'test'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $ in the field name, there are arrays in the path and arrayItemsShouldBeUnique is not provided', function () {
    const result = getNested(
      { foo: [{ $bar: { q: 'test' } }, { $bar: { q: 'test2' } }, { $bar: { q: 'test' } }, { $bar: { q: 'test3' } }] },
      'foo.$bar.q'
    );
    assert.strictEqual(result.length, 4, `bad value ${result.length} for result.length, expected ${4}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test', `bad value ${result[2]} for result[2], expected ${'test'}`);
    assert.strictEqual(result[3], 'test3', `bad value ${result[3]} for result[3], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $ in the field name, there are arrays in the path and arrayItemsShouldBeUnique is set to true', function () {
    const result = getNested(
      { foo: [{ $bar: { q: 'test' } }, { $bar: { q: 'test2' } }, { $bar: { q: 'test' } }, { $bar: { q: 'test3' } }] },
      'foo.$bar.q',
      { arrayItemsShouldBeUnique: true }
    );
    assert.strictEqual(result.length, 3, `bad value ${result.length} for result.length, expected ${3}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test3', `bad value ${result[2]} for result[2], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $$ in the field name and there are no arrays in the path', function () {
    const result = getNested({ foo: { '$bar.baz$': { q: 'test' } } }, 'foo.$bar.baz$.q');
    assert.strictEqual(result, 'test', `bad value ${result} for the method execution result, expected ${'test'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $$ in the field name, there are no arrays in the path and there is a $ variable name', function () {
    const result = getNested({ foo: { $bar: { '$p.baz$': { q: 'test' } } } }, 'foo.$bar.$p.baz$.q');
    assert.strictEqual(result, 'test', `bad value ${result} for the method execution result, expected ${'test'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $$ in the field name, there are arrays in the path and arrayItemsShouldBeUnique is not provided', function () {
    const result = getNested(
      {
        foo: [
          { '$bar.baz$': { q: 'test' } },
          { '$bar.baz$': { q: 'test2' } },
          { '$bar.baz$': { q: 'test' } },
          { '$bar.baz$': { q: 'test3' } }
        ]
      },
      'foo.$bar.baz$.q'
    );
    assert.strictEqual(result.length, 4, `bad value ${result.length} for result.length, expected ${4}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test', `bad value ${result[2]} for result[2], expected ${'test'}`);
    assert.strictEqual(result[3], 'test3', `bad value ${result[3]} for result[3], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, it has an $$ in the field name, there are arrays in the path and arrayItemsShouldBeUnique is set to true', function () {
    const result = getNested(
      {
        foo: [
          { '$bar.baz$': { q: 'test' } },
          { '$bar.baz$': { q: 'test2' } },
          { '$bar.baz$': { q: 'test' } },
          { '$bar.baz$': { q: 'test3' } }
        ]
      },
      'foo.$bar.baz$.q',
      { arrayItemsShouldBeUnique: true }
    );
    assert.strictEqual(result.length, 3, `bad value ${result.length} for result.length, expected ${3}`);
    assert.strictEqual(result[0], 'test', `bad value ${result[0]} for result[0], expected ${'test'}`);
    assert.strictEqual(result[1], 'test2', `bad value ${result[1]} for result[1], expected ${'test2'}`);
    assert.strictEqual(result[2], 'test3', `bad value ${result[2]} for result[2], expected ${'test3'}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent and the last element is an array', function () {
    const result = getNested({ foo: { bar: [] } }, 'foo.bar');
    assert(result instanceof Array, `bad value ${result} for the method execution result, expected an array`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, an inner element is an array and arrayItemsShouldBeUnique is not provided', function () {
    const result = getNested({ foo: { bar: [{ baz: [{ q: 10 }] }, { baz: { q: 11 } }] } }, 'foo.bar.baz.q');
    assert(result instanceof Array, `bad value ${result} for the method execution result, expected an array`);
    assert.strictEqual(result.length, 2, `bad value ${result.length} for result.length, expected ${2}`);
    assert.strictEqual(result[0], 10, `bad value ${result[0]} for result[0], expected ${10}`);
    assert.strictEqual(result[1], 11, `bad value ${result[1]} for result[1], expected ${11}`);
  });
  it('should execute successfully and return the child field if the field does exist in the parent, an inner element is an array and arrayItemsShouldBeUnique is set to true', function () {
    const result = getNested(
      { foo: { bar: [{ baz: [{ q: 10 }, { q: 12 }, { q: 13 }, { q: 12 }] }, { baz: { q: 11 } }] } },
      'foo.bar.baz.q',
      { arrayItemsShouldBeUnique: true }
    );
    assert(result instanceof Array, `bad value ${result} for the method execution result, expected an array`);
    assert.strictEqual(result.length, 4, `bad value ${result.length} for result.length, expected ${2}`);
    assert.strictEqual(result[0], 10, `bad value ${result[0]} for result[0], expected ${10}`);
    assert.strictEqual(result[1], 12, `bad value ${result[1]} for result[1], expected ${12}`);
    assert.strictEqual(result[2], 13, `bad value ${result[2]} for result[2], expected ${13}`);
    assert.strictEqual(result[3], 11, `bad value ${result[3]} for result[3], expected ${11}`);
  });
});
