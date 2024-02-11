import type { Err, Ok, Result } from './result';

export interface IAsyncResult<T, E> extends PromiseLike<Result<T, E>> {
    /**
     * Calls `fn` if the resolved result is `Ok`, otherwise returns `this` as `Err`
     *
     * `fn` *must* return a `Result` or `PromiseLike<Result>`.
     */
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;

    /**
     * Calls `fn` if the resolved result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` *must* return a `Result` or `PromiseLike<Result>`.
     */
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;

    /**
     * Calls `fn` if the resolved result is `Ok`, otherwise returns `this` as `Err`
     *
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncResult<T2, E>;

    /**
     * Calls `fn` if the resolved result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` *must not* fail and therefor have to return a `E2` or `PromiseLike<E2>`.
     */
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): AsyncResult<T, E2>;

    /**
     * Returns a `Promise` of the contained `Ok` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the result is `Err`
     */
    unwrap(): PromiseLike<T>;

    /**
     * Returns a `Promise` of the contained `Err` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the result is `Ok`
     */
    unwrapErr(): PromiseLike<E>;
}

export class AsyncResultImpl<T, E> implements IAsyncResult<T, E> {
    static create<T, E>(promise: PromiseLike<Result<T, E>>): AsyncResult<T, E> {
        return new this(promise) as unknown as AsyncResult<T, E>;
    }

    private constructor(private readonly _promise: PromiseLike<Result<T, E>>) {}

    then<TResult1 = Result<T, E>, TResult2 = never>(
        onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): PromiseLike<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2> {
        return AsyncResultImpl.create<T2, E | E2>(
            this._promise.then(result => {
                const r = result.andThen(fn);
                return r;
            })
        );
    }

    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2> {
        return AsyncResultImpl.create<T | T2, E2>(
            this._promise.then(result => {
                const r = result.orElse(fn);
                return r;
            })
        );
    }

    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncResult<T2, E> {
        return AsyncResultImpl.create<T2, E>(
            this._promise.then(result => {
                const r = result.map<T2>(fn);
                return r;
            })
        );
    }

    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): AsyncResult<T, E2> {
        return AsyncResultImpl.create<T, E2>(
            this._promise.then(result => {
                const r = result.mapErr<E2>(fn);
                return r;
            })
        );
    }

    async unwrap(): Promise<T> {
        return (await this._promise).unwrap();
    }

    async unwrapErr(): Promise<E> {
        return (await this._promise).unwrapErr();
    }
}

export interface AsyncOk<T> extends Omit<AsyncResultImpl<T, never>, 'then'>, PromiseLike<Ok<T>> {
    andThen<T2>(fn: (val: T) => Ok<T2>): AsyncOk<T2>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncOk<T2>;
    andThen<E2>(fn: (val: T) => Err<E2>): AsyncErr<E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E2>;

    orElse(fn: unknown): AsyncOk<T>;

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncOk<T2>;
    map<T2>(fn: (val: T) => T2): AsyncOk<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncOk<T2>;

    mapErr(fn: unknown): AsyncOk<T>;

    unwrap(): Promise<T>;
    unwrapErr(): Promise<never>;
}
export interface AsyncErr<E> extends Omit<AsyncResultImpl<never, E>, 'then'>, PromiseLike<Err<E>> {
    andThen(fn: unknown): AsyncErr<E>;

    orElse<T2>(fn: (err: E) => Ok<T2>): AsyncOk<T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): AsyncErr<E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncErr<E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E2>;

    map(fn: unknown): AsyncErr<E>;

    mapErr<E2>(fn: (err: E) => PromiseLike<E2>): AsyncErr<E2>;
    mapErr<E2>(fn: (err: E) => E2): AsyncErr<E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): AsyncErr<E2>;
}

export type AsyncResult<T, E> = AsyncOk<T> | AsyncErr<E>;
