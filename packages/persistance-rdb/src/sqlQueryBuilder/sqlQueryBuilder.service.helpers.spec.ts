import { SelectQueryBuilder } from 'typeorm';

// A fake SelectQueryBuilder that records method calls.
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export class FakeSelectQueryBuilder<_Entity extends object> {
  calls: string[] = [];
  withDeletedCalls = 0;
  leftJoinAndSelectCalls: Array<{ relation: string; alias: string; condition?: string }> = [];
  selectCalls: string[][] = [];
  whereCalls: Array<{ query: string; params: unknown }> = [];
  andWhereCalls: Array<{ query: string; params: unknown }> = [];
  orderByCalls: Array<{ field: string; direction: string }> = [];
  addOrderByCalls: Array<{ field: string; direction: string }> = [];

  withDeleted(): this {
    this.calls.push('withDeleted');
    this.withDeletedCalls++;
    return this;
  }
  leftJoinAndSelect(relation: string, alias: string, condition?: string): this {
    this.calls.push('leftJoinAndSelect');
    this.leftJoinAndSelectCalls.push({ relation, alias, condition });
    return this;
  }
  select(selection: string[]): this {
    this.calls.push('select');
    this.selectCalls.push(selection);
    return this;
  }
  where(query: string, params: unknown): this {
    this.calls.push('where');
    this.whereCalls.push({ query, params });
    return this;
  }
  andWhere(query: string, params: unknown): this {
    this.calls.push('andWhere');
    this.andWhereCalls.push({ query, params });
    return this;
  }
  orderBy(field: string, direction: string): this {
    this.calls.push('orderBy');
    this.orderByCalls.push({ field, direction });
    return this;
  }
  addOrderBy(field: string, direction: string): this {
    this.calls.push('addOrderBy');
    this.addOrderByCalls.push({ field, direction });
    return this;
  }
}

// Ensure our fake select query builder is recognized as a SelectQueryBuilder.
Object.setPrototypeOf(FakeSelectQueryBuilder.prototype, SelectQueryBuilder.prototype);

// A fake non-select query builder that only implements where methods.
export class FakeOtherQueryBuilder {
  calls: string[] = [];
  whereCalls: Array<{ query: string; params: unknown }> = [];
  andWhereCalls: Array<{ query: string; params: unknown }> = [];

  where(query: string, params: unknown): this {
    this.calls.push('where');
    this.whereCalls.push({ query, params });
    return this;
  }
  andWhere(query: string, params: unknown): this {
    this.calls.push('andWhere');
    this.andWhereCalls.push({ query, params });
    return this;
  }
}
