import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";

class TypeWithEquality<T> {
  private typeConstructor: { new (...args: any[]): T };
  private equalityFn: (obj1: T, obj2: T) => boolean;

  constructor(
    constructor: { new (...args: any[]): T },
    equalityFn: (obj1: T, obj2: T) => boolean
  ) {
    this.typeConstructor = constructor;
    this.equalityFn = equalityFn;
  }

  isInstance(obj: any): boolean {
    return obj instanceof this.typeConstructor;
  }

  eq(obj1: T, obj2: T): boolean {
    return this.equalityFn(obj1, obj2);
  }

  get name(): string {
    return this.typeConstructor.name;
  }
}

const typesWithEq = [
  new TypeWithEquality(BN, (val1, val2) => val1.eq(val2)),
  new TypeWithEquality(PublicKey, (val1, val2) => val1.equals(val2)),
  new TypeWithEquality(
    Array,
    (val1, val2) =>
      val1.length === val2.length &&
      val1.every((el, idx) => {
        expectDeep({ inner: el }).include({ inner: val2[idx] });
        return true;
      })
  ),
];

export const expectDeep = (target: any) => {
  return {
    include: (source: Record<string, any>) => {
      Object.entries(source).forEach(([key, val]) => {
        assert(key in target, `Missing key "${key}"`);
        const targetVal = target[key];

        for (const T of typesWithEq) {
          if (T.isInstance(val)) {
            assert(T.isInstance(targetVal), `Field "${key}" not a ${T.name}`);
            assert(
              T.eq(val, targetVal),
              `Field "${key}" not equal: (expected) ${val.toString()} !== ${targetVal.toString()} (actual)`
            );

            return;
          }
        }

        expect(val).to.deep.eq(targetVal);
      });
    },
  };
};
