import { strict as assert } from 'assert';

import { setNested } from '../../dist';

describe('setNested', function () {
  it('should execute successfully and return false if an empty string field argument is provided', function () {
    const result = setNested({}, '', true);
    assert.strictEqual(result, false, `bad value ${result} for the method execution result, expected false`);
  });
  it('should execute successfully and return false if a step in the path does not exist in the parent', function () {
    const result = setNested({}, 'foo.bar', true);
    assert.strictEqual(result, false, `bad value ${result} for the method execution result, expected false`);
  });
  it('should execute successfully, set the child field and return true if the field does exist in the parent and there are no arrays in the path', function () {
    const inputObject = { foo: {} } as any,
      result = setNested(inputObject, 'foo.bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo.bar,
      'test',
      `bad value ${inputObject.foo.bar} for the method execution inputObject.foo.bar, expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent and there are no arrays in the path', function () {
    const inputObject = { foo: { bar: 'oldTest' } } as any,
      result = setNested(inputObject, 'foo.bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo.bar,
      'test',
      `bad value ${inputObject.foo.bar} for the method execution inputObject.foo.bar, expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there are arrays in the path and an index for them is provided', function () {
    const inputObject = { foo: [{ bar: 'test1' }, { bar: 'test2' }] },
      result = setNested(inputObject, 'foo.0.bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0].bar,
      'test',
      `bad value ${inputObject.foo[0].bar} for the method execution inputObject.foo[0].bar, expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1].bar,
      'test2',
      `bad value ${inputObject.foo[1].bar} for the method execution inputObject.foo[1].bar, expected ${'test2'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there are arrays in the path and an index for them is not provided', function () {
    const inputObject = { foo: [{ bar: 'test1' }, { bar: 'test2' }] },
      result = setNested(inputObject, 'foo.bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0].bar,
      'test',
      `bad value ${inputObject.foo[0].bar} for the method execution inputObject.foo[0].bar, expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1].bar,
      'test',
      `bad value ${inputObject.foo[1].bar} for the method execution inputObject.foo[1].bar, expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field does exist in the parent, there is an $ in the path and there are no arrays in the path', function () {
    const inputObject = { foo: {} } as any,
      result = setNested(inputObject, 'foo.$bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar'],
      'test',
      `bad value ${inputObject.foo['$bar']} for the method execution inputObject.foo['$bar'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $ in the path and there are no arrays in the path', function () {
    const inputObject = { foo: { $bar: 'oldTest' } } as any,
      result = setNested(inputObject, 'foo.$bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar'],
      'test',
      `bad value ${inputObject.foo['$bar']} for the method execution inputObject.foo['$bar'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $ in the path, there are arrays in the path and an index for them is provided', function () {
    const inputObject = { foo: [{ $bar: 'test1' }, { $bar: 'test2' }] },
      result = setNested(inputObject, 'foo.0.$bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0]['$bar'],
      'test',
      `bad value ${inputObject.foo[0]['$bar']} for the method execution inputObject.foo[0]['$bar'], expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1]['$bar'],
      'test2',
      `bad value ${inputObject.foo[1]['$bar']} for the method execution inputObject.foo[1]['$bar'], expected ${'test2'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $ in the path, there are arrays in the path and an index for them is not provided', function () {
    const inputObject = { foo: [{ $bar: 'test1' }, { $bar: 'test2' }] },
      result = setNested(inputObject, 'foo.$bar', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0]['$bar'],
      'test',
      `bad value ${inputObject.foo[0]['$bar']} for the method execution inputObject.foo[0]['$bar'], expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1]['$bar'],
      'test',
      `bad value ${inputObject.foo[1]['$bar']} for the method execution inputObject.foo[1]['$bar'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field does exist in the parent, there is an $$ in the path and an $ in the path, and there are no arrays in the path', function () {
    const inputObject = { foo: { $bar: {} } } as any,
      result = setNested(inputObject, 'foo.$bar.$q.boo.baz$', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar']['$q.boo.baz$'],
      'test',
      `bad value ${inputObject.foo['$bar']['$q.boo.baz$']} for the method execution inputObject.foo['$bar']['$q.boo.baz$'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field does exist in the parent, there is an $$ in the path and there are no arrays in the path', function () {
    const inputObject = { foo: {} } as any,
      result = setNested(inputObject, 'foo.$bar.baz$', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar.baz$'],
      'test',
      `bad value ${inputObject.foo['$bar.baz$']} for the method execution inputObject.foo['$bar.baz$'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $$ in the path, there are no arrays in the path and the $$ item is the last item', function () {
    const inputObject = { foo: { '$bar.baz$': 'oldTest' } } as any,
      result = setNested(inputObject, 'foo.$bar.baz$', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar.baz$'],
      'test',
      `bad value ${inputObject.foo['$bar.baz$']} for the method execution inputObject.foo['$bar.baz$'], expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $$ in the path, there are no arrays in the path and the $$ item is not the last item', function () {
    const inputObject = { foo: { '$bar.baz$': { boo: 'oldTest' } } } as any,
      result = setNested(inputObject, 'foo.$bar.baz$.boo', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo['$bar.baz$'].boo,
      'test',
      `bad value ${inputObject.foo['$bar.baz$'].boo} for the method execution inputObject.foo['$bar.baz$'].boo, expected ${'test'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $$ in the path, there are arrays in the path and an index for them is provided', function () {
    const inputObject = { foo: [{ '$bar.baz$': 'test1' }, { '$bar.baz$': 'test2' }] },
      result = setNested(inputObject, 'foo.0.$bar.baz$', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0]['$bar.baz$'],
      'test',
      `bad value ${inputObject.foo[0]['$bar.baz$']} for the method execution inputObject.foo[0]['$bar.baz$'], expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1]['$bar.baz$'],
      'test2',
      `bad value ${inputObject.foo[1]['$bar.baz$']} for the method execution inputObject.foo[1]['$bar.baz$'], expected ${'test2'}`
    );
  });
  it('should execute successfully, set the child field and return true if the field exists in the parent, there is an $$ in the path, there are arrays in the path and an index for them is not provided', function () {
    const inputObject = { foo: [{ '$bar.baz$': 'test1' }, { '$bar.baz$': 'test2' }] },
      result = setNested(inputObject, 'foo.$bar.baz$', 'test');
    assert.strictEqual(result, true, `bad value ${result} for the method execution result, expected ${true}`);
    assert.strictEqual(
      inputObject.foo[0]['$bar.baz$'],
      'test',
      `bad value ${inputObject.foo[0]['$bar.baz$']} for the method execution inputObject.foo[0]['$bar.baz$'], expected ${'test'}`
    );
    assert.strictEqual(
      inputObject.foo[1]['$bar.baz$'],
      'test',
      `bad value ${inputObject.foo[1]['$bar.baz$']} for the method execution inputObject.foo[1]['$bar.baz$'], expected ${'test'}`
    );
  });
});
