export type Scalar = boolean | string | number | null | undefined;

export type Awaited<T> = T extends PromiseLike<infer R> ? R : T;

export type SaveAwaitable<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => AwaitablePromise<Awaited<R>> : AwaitablePromise<T[K]>;
};

export interface AwaitablePromise<T> extends Omit<Promise<T>, 'await'> {
    await: T extends Scalar ? never : SaveAwaitable<T>;
}

export function awaitable<T extends object>(promise: Promise<T>, context?: Promise<unknown>): AwaitablePromise<T> {
    return new Proxy(Function, {
        get(_target, p) {
            if (p === 'then') {
                return promise.then.bind(promise);
            }
            if (p === 'await') {
                return awaitable(promise, context);
            }
            return awaitable<any>(
                promise.then(o => Reflect.get(o, p)),
                promise
            );
        },
        apply: function (_target, thisArg, argArray) {
            return awaitable(Promise.all([promise, context]).then(([fn, context]) => (fn as Function).apply(context ?? thisArg, argArray)));
        }
    }) as unknown as AwaitablePromise<T>;
}
