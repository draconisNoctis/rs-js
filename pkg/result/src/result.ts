import assert from 'node:assert';
import { isPromise, toString } from '@rs-js/utils';
import { AsyncErr, AsyncOk, AsyncResult, AsyncResultImpl } from './async-result';

export interface IResult<T, E> {
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
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E | E2> | AsyncResult<T2, E | E2>;

    /**
     * Calls `fn` if the result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must* return a `Result` or `PromiseLike<Result>`.
     */
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T | T2, E2> | AsyncResult<T | T2, E2>;

    /**
     * Calls `fn` if the result is `Ok`, otherwise returns `this` as `Err`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Result<T2, E> | AsyncResult<T2, E>;

    /**
     * Calls `fn` if the result is `Err`, otherwise returns `this` as `Ok`
     *
     * `fn` can return a `Promise` which will return a `AsyncResult`.
     * `fn` *must not* fail and therefor have to return a `E2` or `PromiseLike<E2>`.
     */
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

const STACK = Symbol('STACK');

export class OkImpl<T> implements IResult<T, never> {
    get value(): T {
        return this._value as T;
    }

    constructor(private readonly _value: T) {}

    isOk(): this is Ok<T> {
        return true;
    }

    isErr(): this is Err<never> {
        return false;
    }

    andThen<T2>(fn: (val: T) => Ok<T2>): Ok<T2>;
    andThen<T2>(fn: (val: T) => PromiseLike<Ok<T2>>): AsyncOk<T2>;
    andThen<E2>(fn: (val: T) => Err<E2>): Err<E2>;
    andThen<E2>(fn: (val: T) => PromiseLike<Err<E2>>): AsyncErr<E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2>): Result<T2, E2>;
    andThen<T2, E2>(fn: (val: T) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E2> | AsyncResult<T2, E2>;
    andThen<T2, E2>(fn: (val: T) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E2> | AsyncResult<T2, E2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return AsyncResultImpl.create(result);
        } else {
            return result;
        }
    }

    orElse(_fn: unknown): this {
        return this;
    }

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncOk<T2>;
    map<T2>(fn: (val: T) => T2): Ok<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Ok<T2> | AsyncOk<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Ok<T2> | AsyncOk<T2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return AsyncResultImpl.create(result.then(r => Ok(r))) as AsyncOk<T2>;
        } else {
            return Ok(result);
        }
    }

    mapErr(_fn: unknown): this {
        return this;
    }

    unwrap(): T {
        return this._value;
    }

    safeUnwrap(): T {
        return this._value;
    }

    unwrapErr(): never {
        throw new Error(`Tried to unwrap Ok: ${toString(this._value)}`, { cause: this._value });
    }
}

export class ErrImpl<E> implements IResult<never, E> {
    get error(): E {
        return this._error as E;
    }

    get stack(): string {
        assert(this.isErr());
        return this[STACK];
    }

    private readonly [STACK]: string;

    constructor(private readonly _error: E) {
        const stackLines = new Error().stack!.split('\n').slice(2);
        if (stackLines && stackLines.length > 0 && stackLines[0].includes('result.')) {
            stackLines.shift();
        }

        this[STACK] = stackLines.join('\n');
    }

    isOk(): this is Ok<never> {
        return false;
    }

    isErr(): this is Err<E> {
        return true;
    }

    andThen(_fn: unknown): this {
        return this;
    }

    orElse<T2>(fn: (err: E) => Ok<T2>): Ok<T2>;
    orElse<T2>(fn: (err: E) => PromiseLike<Ok<T2>>): AsyncOk<T2>;
    orElse<E2>(fn: (err: E) => Err<E2>): Err<E2>;
    orElse<E2>(fn: (err: E) => PromiseLike<Err<E2>>): AsyncErr<E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2>): Result<T2, E2>;
    orElse<T2, E2>(fn: (err: E) => PromiseLike<Result<T2, E2>>): AsyncResult<T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): Result<T2, E2> | AsyncResult<T2, E2>;
    orElse<T2, E2>(fn: (err: E) => Result<T2, E2> | PromiseLike<Result<T2, E2>>): any | Result<T2, E2> | AsyncResult<T2, E2> {
        let result = fn(this.error);

        if (isPromise(result)) {
            return AsyncResultImpl.create(result);
        } else {
            return result;
        }
    }

    map(_fn: unknown): this {
        return this;
    }

    mapErr<E2>(fn: (err: E) => PromiseLike<E2>): AsyncErr<E2>;
    mapErr<E2>(fn: (err: E) => E2): Err<E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): Err<E2> | AsyncErr<E2>;
    mapErr<E2>(fn: (err: E) => E2 | PromiseLike<E2>): Err<E2> | AsyncErr<E2> {
        let result = fn(this.error);

        if (isPromise(result)) {
            return AsyncResultImpl.create(result.then(r => Err(r))) as AsyncErr<E2>;
        } else {
            return Err(result);
        }
    }

    unwrap(): never {
        throw new Error(`Tried to unwrap Err: ${toString(this._error)}\n${this[STACK]}`, { cause: this._error });
    }

    unwrapErr(): E {
        return this._error;
    }
}

export type Ok<T> = OkImpl<T>;
export type Err<E> = ErrImpl<E>;
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Creates an `Ok` result
 */
export function Ok<T>(value: T): Ok<T>;
export function Ok(): Ok<void>;
export function Ok<T>(value?: T): Ok<T> | Ok<void> {
    return new OkImpl<T | void>(value) as Ok<T> | Ok<void>;
}

/**
 * Creates an `Err` result
 */
export function Err<E>(value: E): Err<E> {
    return new ErrImpl<E>(value);
}
