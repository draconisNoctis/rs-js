/**
 *
 * ## Usage
 *
 * ```typescript
 * import 'rs-js/await';
 *
 * interface Obj1 {
 *     method1(): Promise<Obj2>;
 * }
 *
 * interface Obj2 {
 *     method2(): Promise<Obj3>;
 * }
 *
 * interface Obj3 {
 *     result: string;
 * }
 *
 * declare const obj: Promise<Obj1>;
 *
 * // Standard JS/TS await syntax
 *
 * const result = (await (await (await obj).method1()).method2()).result;
 *
 * // or with deconstructoring
 *
 * const { result } = await (await (await obj).method1()).method2();
 *
 * // with rust-like await
 *
 * const result = await obj.await.method1().await.method2().await.result;
 *
 * // or with deconstructoring
 *
 * const { result } = await obj.await.method1().await.method2();
 * ```
 * @module Await
 */

import { Scalar, awaitable } from './awaitable';

export type Awaitable<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<Awaited<R>> : Promise<T[K]>;
};

declare global {
    interface Promise<T> {
        await: T extends Scalar ? never : Awaitable<T>;
    }
}

Object.defineProperty(Promise.prototype, 'await', {
    get<T extends object>(this: Promise<T>) {
        return awaitable(this);
    }
});
