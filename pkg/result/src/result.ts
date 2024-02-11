import assert from 'node:assert';
import { isPromise, toString } from '@rs-js/utils';
import { AsyncErr, AsyncOk, AsyncResult, AsyncResultImpl } from './async-result';

export interface Result<T, E> {
    /**
     * Returns `true` if the result is `Ok`
     */
    isOk(): this is Ok<T>;

    /**
     * Returns `true` if the result is `Err`
     */
    isErr(): this is Err<E>;

    /**
     * Calls `fn` if the result is `Ok`, otherwise returns `this` as `Err`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must* return a `Result` or `PromiseLike<Result>`.
     */
    andThen<T2>(fn: (val: T) => Ok<T2>): Result<T2, E>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncResult<T2, E>;
    andThen<E2>(fn: (val: T) => Err<E2>): Err<E | E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): Result<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E | E2> | AsyncResult<T2, E | E2>;

    /**
     * Calls `fn` if the result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must* return a `Result` or `PromiseLike<Result>`.
     */
    orElse<T2>(fn: (err: E) => Ok<T2>): Ok<T | T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T | T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): Result<T, E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncResult<T, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): Result<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T | T2, E2> | AsyncResult<T | T2, E2>;

    /**
     * Calls `fn` if the result is `Ok`, otherwise returns `this` as `Err`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2): Result<T2, E>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Result<T2, E> | AsyncResult<T2, E>;

    /**
     * Calls `fn` if the result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must not* fail and therefor have to return a `E2` or `PromiseLike<E2>`.
     */
    mapErr<E2>(fn: (err: E) => PromiseLike<E2>): AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2): Result<T, E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): Result<T, E2> | AsyncResult<T, E2>;

    /**
     * Returns the contained `Ok` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the result is `Err`
     */
    unwrap(): T;

    /**
     * Returns the contained `Err` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the result is `Ok`
     */
    unwrapErr(): E;
}

/**
 * Contains the success value
 */
export interface Ok<T> extends Result<T, never> {
    value: T;
}

/**
 * Contains the error value
 */
export interface Err<E> extends Result<never, E> {
    error: E;
    stack: string;
}

enum Kind {
    Ok = 'ok',
    Err = 'err'
}

const STACK = Symbol('STACK');

export class ResultImpl<T, E> implements Result<T, E> {
    get value(): T {
        assert(this.isOk());
        return this._value as T;
    }

    get error(): E {
        assert(this.isErr());
        return this._value as E;
    }

    get stack(): string {
        assert(this.isErr());
        return this[STACK];
    }

    private readonly [STACK]: string;

    constructor(
        private readonly _value: T | E,
        private readonly _kind: Kind
    ) {
        const stackLines = new Error().stack!.split('\n').slice(2);
        if (stackLines && stackLines.length > 0 && stackLines[0].includes('result.')) {
            stackLines.shift();
        }

        this[STACK] = stackLines.join('\n');
    }

    isOk(): this is Ok<T> {
        return this._kind === Kind.Ok;
    }

    isErr(): this is Err<E> {
        return this._kind === Kind.Err;
    }

    andThen<T2>(fn: (val: T) => Ok<T2>): Result<T2, E>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncResult<T2, E>;
    andThen<E2>(fn: (val: T) => Err<E2>): Err<E | E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): Result<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E | E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E | E2> | AsyncResult<T2, E | E2>;
    andThen<T2, E2>(
        fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>
    ): Result<T2, E | E2> | AsyncResult<T2, E | E2> | AsyncResult<T2, E> {
        if (this.isErr()) return this;

        let result = fn(this.value);

        if (isPromise(result)) {
            return new AsyncResultImpl(result);
        } else {
            return result;
        }
    }

    orElse<T2>(fn: (err: E) => Ok<T2>): Ok<T | T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T | T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): Result<T, E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncResult<T, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): Result<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): AsyncResult<T | T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T | T2, E2> | AsyncResult<T | T2, E2>;
    orElse<T2, E2>(
        fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>
    ): Result<T | T2, E2> | AsyncResult<T | T2, E2> | AsyncResult<T | T2, E2> {
        if (this.isOk()) return this;

        let result = fn(this.error);

        if (isPromise(result)) {
            return new AsyncResultImpl(result);
        } else {
            return result;
        }
    }

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2): Result<T2, E>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Result<T2, E> | AsyncResult<T2, E>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Result<T2, E> | AsyncResult<T2, E> | AsyncResult<T2, E> {
        if (this.isErr()) return this as any;

        let result = fn(this.value);

        if (isPromise(result)) {
            return new AsyncResultImpl(result.then(r => Ok(r)));
        } else {
            return Ok(result);
        }
    }

    mapErr<E2>(fn: (err: E) => PromiseLike<E2>): AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2): Result<T, E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): Result<T, E2> | AsyncResult<T, E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): Result<T, E2> | AsyncResult<T, E2> | AsyncResult<T, E2> {
        if (this.isOk()) return this;

        let result = fn(this.error);

        if (isPromise(result)) {
            return new AsyncResultImpl(result.then(r => Err(r)));
        } else {
            return Err(result);
        }
    }

    unwrap(): T {
        if (this.isOk()) {
            return this.value;
        }

        throw new Error(`Tried to unwrap Err: ${toString(this._value)}\n${this[STACK]}`, { cause: this._value });
    }

    unwrapErr(): E {
        if (this.isErr()) {
            return this.error;
        }

        throw new Error(`Tried to unwrap Ok: ${toString(this._value)}`, { cause: this._value });
    }
}

/**
 * Creates an `Ok` result
 */
export function Ok<T>(value: T): Ok<T>;
export function Ok(): Ok<void>;
export function Ok<T>(value?: T): Ok<T> | Ok<void> {
    return new ResultImpl<T | void, never>(value, Kind.Ok) as Ok<T> | Ok<void>;
}

/**
 * Creates an `Err` result
 */
export function Err<E>(value: E): Err<E> {
    return new ResultImpl<never, E>(value, Kind.Err);
}
