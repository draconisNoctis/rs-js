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
