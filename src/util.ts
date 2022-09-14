import { name as PKG_NAME, version as PKG_VERSION } from "../package.json";

export const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export function setHasInstance<
  T extends {
    new (...args: ConstructorParameters<T>): InstanceType<T>;
    prototype: InstanceType<T>;
  },
>(cls: T): void {
  // Use a symbol to indentify instances, this helps to provide better
  // compatibility for bundled copies of the class.
  const symbol = Symbol.for(`${PKG_NAME}[${cls.name}]`);

  Object.defineProperty(cls.prototype, symbol, {
    configurable: false,
    enumerable: false,
    value: PKG_VERSION,
    writable: false,
  });

  Object.defineProperty(cls, Symbol.hasInstance, {
    configurable: false,
    enumerable: false,
    value: (instance: unknown): instance is InstanceType<T> =>
      typeof instance === "object" && instance !== null && symbol in instance,
    writable: false,
  });
}
