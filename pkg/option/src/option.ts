import { isPromise } from '@rs-js/utils';
import { AsyncNone, AsyncOption, AsyncOptionImpl, AsyncSome } from './async-option';

declare global {
    var __Option_Some: any;
    var __Option_None: any;
}

export interface IOption<T> {
    /**
     * Returns `true` if the option is `Some`
     */
    isSome(): this is Some<T>;

    /**
     * Returns `true` if the option is `None`
     */
    isNone(): this is None;

    /**
     * Calls `fn` if the option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must* return an `Option` or `PromiseLike<Option>`.
     */
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2>;

    /**
     * Calls `fn` if the option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must* return an `Option` or `PromiseLike<Option>`.
     */
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T | T2> | AsyncOption<T | T2>;

    /**
     * Calls `fn` if the option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2>;

    /**
     * Calls `fn` if the option is `None`, otherwise returns `this` as `Some`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Option<T | T2> | AsyncOption<T | T2>;

    orNull(): T | null;
    orUndefined(): T | undefined;

    /**
     * Returns the contained `Some` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the option is `None`
     */
    unwrap(): T;
}

export class SomeImpl<T> implements IOption<T> {
    constructor(public readonly value: T) {}

    isSome(): this is Some<T> {
        return true;
    }

    isNone(): this is None {
        return false;
    }

    and<T2>(fn: (val: T) => Some<T2>): Some<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Some<T2>>): AsyncSome<T2>;
    and<T2>(fn: (val: T) => None): None;
    and<T2>(fn: (val: T) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: T) => Option<T2>): Option<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return AsyncOptionImpl.create(result);
        } else {
            return result;
        }
    }

    or(fn: unknown): this {
        return this;
    }

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncSome<T2>;
    map<T2>(fn: (val: T) => T2): Some<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Some<T2> | AsyncSome<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Some<T2> | AsyncSome<T2> | AsyncSome<T2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return AsyncOptionImpl.create(result.then(r => Some(r))) as AsyncSome<T2>;
        } else {
            return Some(result);
        }
    }

    orElse(_fn: unknown): this {
        return this;
    }

    orNull(): T {
        return this.value;
    }

    orUndefined(): T {
        return this.value;
    }

    unwrap(): T {
        return this.value;
    }
}

export class NoneImpl implements IOption<never> {
    constructor() {}

    isSome(): this is Some<never> {
        return false;
    }

    isNone(): this is None {
        return true;
    }

    and(fn: unknown): this {
        return this;
    }

    or<T2>(fn: () => Some<T2>): Some<T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<T2>;
    or<T2>(fn: () => None): None;
    or<T2>(fn: () => PromiseLike<None>): AsyncNone;
    or<T2>(fn: () => Option<T2>): Option<T2>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2> {
        let result = fn();

        if (isPromise(result)) {
            return AsyncOptionImpl.create(result);
        } else {
            return result;
        }
    }

    map(fn: unknown): this {
        return this;
    }

    orElse<T2>(fn: () => PromiseLike<T2>): AsyncSome<T2>;
    orElse<T2>(fn: () => T2): Some<T2>;
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Some<T2> | AsyncSome<T2>;
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Some<T2> | AsyncSome<T2> {
        let result = fn();

        if (isPromise(result)) {
            return AsyncOptionImpl.create(result.then(r => Some(r))) as AsyncSome<T2>;
        } else {
            return Some(result);
        }
    }

    orNull(): null {
        return null;
    }

    orUndefined(): undefined {
        return undefined;
    }

    unwrap(): never {
        throw new Error(`Tried to unwrap None`);
    }
}

export type Some<T> = SomeImpl<T>;
export type None = NoneImpl;

export type Option<T> = Some<T> | None;

/**
 * Creates an `Some` option
 */
export function Some<T>(value: T): Some<T>;
export function Some(): Some<void>;
export function Some<T>(value?: T): Some<T> | Some<void> {
    return new SomeImpl<T | void>(value) as Some<T> | Some<void>;
}

/**
 * None option
 */
export const None: None = new NoneImpl();

// @rs-js/result interop
globalThis.__Option_Some = Some;
globalThis.__Option_None = None;
