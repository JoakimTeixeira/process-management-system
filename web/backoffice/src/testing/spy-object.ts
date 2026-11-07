import { vi, type Mock } from 'vitest';

export type SpyObject<T extends object> = {
  [Key in keyof T]: T[Key] extends (...args: infer Arguments) => infer Result
    ? Mock<(...args: Arguments) => Result>
    : T[Key];
};

export function createSpyObject<T extends object>(methodNames: readonly (keyof T)[]): SpyObject<T> {
  return Object.fromEntries(methodNames.map((methodName) => [methodName, vi.fn()])) as SpyObject<T>;
}
