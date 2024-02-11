import { isPromise } from '@rs-js/utils';
import { AsyncNone, AsyncOption, AsyncOptionImpl, AsyncSome } from './async-option';

export interface Option<T> {
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
    and<T2>(fn: (val: T) => Some<T2>): Option<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Some<T2>>): AsyncOption<T2>;
    and(fn: (val: T) => None): None;
    and(fn: (val: T) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: T) => Option<T2>): Option<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2>;

    /**
     * Calls `fn` if the option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must* return an `Option` or `PromiseLike<Option>`.
     */
    or<T2>(fn: () => Some<T2>): Some<T | T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<T | T2>;
    or(fn: () => None): Option<T>;
    or(fn: () => PromiseLike<None>): AsyncOption<T>;
    or<T2>(fn: () => Option<T2>): Option<T | T2>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<T | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T | T2> | AsyncOption<T | T2>;

    /**
     * Calls `fn` if the option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncOption<T2>;
    map<T2>(fn: (val: T) => T2): Option<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2>;

    /**
     * Calls `fn` if the option is `None`, otherwise returns `this` as `Some`
     *
     * `fn` can return a `Promise` which will return a `AsyncOption`.
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    orElse<T2>(fn: () => PromiseLike<T2>): AsyncOption<T | T2>;
    orElse<T2>(fn: () => T2): Option<T | T2>;
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

/**
 * Contains the value
 */
export interface Some<T> extends Option<T> {
    value: T;
}

/**
 * Contains the null value
 */
export interface None extends Option<never> {
    // map<T2>(fn: (val: unknown) => PromiseLike<T2>): None;
    // map<T2>(fn: (val: unknown) => T2): None;
    // map<T2>(fn: (val: unknown) => T2 | PromiseLike<T2>): None;
    // and<T2>(fn: (val: unknown) => Some<T2>): None;
    // and<T2>(fn: (val: unknown) => PromiseLike<Some<T2>>): None;
    // and(fn: (val: unknown) => None): None;
    // and(fn: (val: unknown) => PromiseLike<None>): None;
    // and<T2>(fn: (val: unknown) => T2): None;
    // and<T2>(fn: (val: unknown) => PromiseLike<T2>): None;
    // and<T2>(fn: (val: unknown) => T2 | PromiseLike<T2>): None;
}

export class SomeImpl<T> implements Some<T> {
    constructor(public readonly value: T) {}

    isSome(): this is Some<T> {
        return true;
    }

    isNone(): this is None {
        return false;
    }

    and<T2>(fn: (val: T) => Some<T2>): Option<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Some<T2>>): AsyncOption<T2>;
    and(fn: (val: T) => None): None;
    and(fn: (val: T) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: T) => Option<T2>): Option<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return new AsyncOptionImpl(result);
        } else {
            return result;
        }
    }

    or<T2>(fn: () => Some<T2>): Some<T | T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<T | T2>;
    or(fn: () => None): Option<T>;
    or(fn: () => PromiseLike<None>): AsyncOption<T>;
    or<T2>(fn: () => Option<T2>): Option<T | T2>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<T | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T | T2> | AsyncOption<T | T2>;
    or(): Option<T> | AsyncOption<T> {
        return this;
    }

    map<T2>(fn: (val: T) => PromiseLike<T2>): AsyncOption<T2>;
    map<T2>(fn: (val: T) => T2): Option<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2>;
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2> | AsyncOption<T2> {
        let result = fn(this.value);

        if (isPromise(result)) {
            return new AsyncOptionImpl(result.then(r => Some(r)));
        } else {
            return Some(result);
        }
    }

    orElse<T2>(fn: () => PromiseLike<T2>): AsyncOption<T | T2>;
    orElse<T2>(fn: () => T2): Option<T | T2>;
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Option<T | T2> | AsyncOption<T | T2>;
    orElse<T2>(_fn: () => T2 | PromiseLike<T2>): Option<T | T2> | AsyncOption<T | T2> {
        return this;
    }

    orNull(): T | null {
        return this.value;
    }

    orUndefined(): T | undefined {
        return this.value;
    }

    unwrap(): T {
        return this.value;
    }
}

export class NoneImpl implements None {
    constructor() {}

    isSome(): this is Some<never> {
        return false;
    }

    isNone(): this is None {
        return true;
    }

    and<T2>(fn: (val: never) => Some<T2>): Option<never | T2>;
    and<T2>(fn: (val: never) => PromiseLike<Some<T2>>): AsyncOption<never>;
    and(fn: (val: never) => None): None;
    and(fn: (val: never) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: never) => Option<T2>): Option<never>;
    and<T2>(fn: (val: never) => PromiseLike<Option<T2>>): AsyncOption<never>;
    and<T2>(fn: (val: never) => Option<T2> | PromiseLike<Option<T2>>): Option<never | T2> | AsyncOption<never | T2>;
    and<T2>(fn: any): Option<never | T2> | AsyncOption<never | T2> {
        return this;
    }

    or<T2>(fn: () => Some<T2>): Some<never | T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<never | T2>;
    or(fn: () => None): Option<never>;
    or(fn: () => PromiseLike<None>): AsyncOption<never>;
    or<T2>(fn: () => Option<T2>): Option<never | T2>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<never | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<never | T2> | AsyncOption<never | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): Option<T2> | AsyncOption<T2> {
        let result = fn();

        if (isPromise(result)) {
            return new AsyncOptionImpl(result);
        } else {
            return result;
        }
    }

    map<T2>(fn: (val: never) => PromiseLike<T2>): AsyncOption<T2>;
    map<T2>(fn: (val: never) => T2): Option<T2>;
    map<T2>(fn: (val: never) => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2>;
    map<T2>(): Option<T2> | AsyncOption<T2> {
        return this;
    }

    orElse<T2>(fn: () => PromiseLike<T2>): AsyncOption<never | T2>;
    orElse<T2>(fn: () => T2): Option<never | T2>;
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Option<never | T2> | AsyncOption<never | T2>;
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): Option<T2> | AsyncOption<T2> {
        let result = fn();

        if (isPromise(result)) {
            return new AsyncOptionImpl(result.then(r => Some(r)));
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
