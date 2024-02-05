import type { Err, Ok, Result } from './result';

export interface MaybeAsyncResult<T, E, R extends Result<T, E> = Result<T, E>> extends PromiseLike<R> {
    andThen<T2>(fn: (val: T) => Ok<T2>): MaybeAsyncResult<T2, E>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): MaybeAsyncResult<T2, E>;
    andThen<E2>(fn: (val: T) => Err<E2>): MaybeAsyncErr<E | E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): MaybeAsyncErr<E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): MaybeAsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): MaybeAsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): MaybeAsyncResult<T2, E | E2>;

    orElse<T2>(fn: (err: E) => Ok<T2>): MaybeAsyncOk<T | T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): MaybeAsyncOk<T | T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): MaybeAsyncResult<T, E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): MaybeAsyncResult<T, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): MaybeAsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): MaybeAsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): MaybeAsyncResult<T | T2, E2>;

    unwrap(): PromiseLike<T> | T;
    unwrapErr(): PromiseLike<E> | E;
}

export interface MaybeAsyncOk<T> extends MaybeAsyncResult<T, never> {}
export interface MaybeAsyncErr<E> extends MaybeAsyncResult<never, E> {}

export interface AsyncResult<T, E, R extends Result<T, E> = Result<T, E>> extends PromiseLike<R> {
    andThen<T2>(fn: (val: T) => Ok<T2>): AsyncResult<T2, E>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncResult<T2, E>;
    andThen<E2>(fn: (val: T) => Err<E2>): AsyncErr<E | E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;

    orElse<T2>(fn: (err: E) => Ok<T2>): AsyncOk<T | T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T | T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): AsyncResult<T, E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncResult<T, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;

    unwrap(): PromiseLike<T>;
    unwrapErr(): PromiseLike<E>;
}

export interface AsyncOk<T> extends AsyncResult<T, never, Ok<T>> {}
export interface AsyncErr<E> extends AsyncResult<never, E, Err<E>> {}

export class AsyncResultImpl<T, E> implements AsyncResult<T, E> {
    constructor(private readonly _promise: PromiseLike<Result<T, E>>) {}

    then<TResult1 = Result<T, E>, TResult2 = never>(
        onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): PromiseLike<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    andThen<T2>(fn: (val: T) => Ok<T2>): AsyncResult<T2, E>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncResult<T2, E>;
    andThen<E2>(fn: (val: T) => Err<E2>): AsyncErr<E | E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2> {
        return new AsyncResultImpl(
            this._promise.then(result => {
                const r = result.andThen<T2, E2>(fn);
                return r;
            })
        );
    }

    orElse<T2>(fn: (err: E) => Ok<T2>): AsyncOk<T | T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T | T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): AsyncResult<T, E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncResult<T, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2> {
        return new AsyncResultImpl(
            this._promise.then(result => {
                const r = result.orElse(fn);
                return r;
            })
        );
    }

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2): AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncResult<T2, E> {
        return new AsyncResultImpl(
            this._promise.then(result => {
                const r = result.map<T2>(fn);
                return r;
            })
        );
    }

    mapErr<E2>(fn: (err: E) => PromiseLike<E2>): AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2): AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): AsyncResult<T, E2> {
        return new AsyncResultImpl(
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
