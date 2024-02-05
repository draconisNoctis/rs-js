import type { None, Some, Option } from './option';

export interface AsyncOption<T> extends PromiseLike<Option<T>> {
    /**
     * Calls `fn` if the resolved option is `Some`, otherwise returns `this` as `None`
     *
     * `fn` *must* return a `Option` or `PromiseLike<Option>`.
     */
    and<T2>(fn: (val: T) => Some<T2>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Some<T2>>): AsyncOption<T2>;
    and(fn: (val: T) => None): AsyncNone;
    and(fn: (val: T) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: T) => Option<T2>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T2>;

    /**
     * Calls `fn` if the resolved option is `None`, otherwise returns `this` as `Some`
     *
     * `fn` *must* return a `Option` or `PromiseLike<Option>`.
     */
    or<T2>(fn: () => Some<T2>): AsyncSome<T | T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<T | T2>;
    or(fn: () => None): AsyncOption<T>;
    or(fn: () => PromiseLike<None>): AsyncOption<T>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<T | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T | T2>;

    /**
     * Calls `fn` if the resolved option is `Some`, otherwise returns `this` as `Some`
     *
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncOption<T2>;

    /**
     * Calls `fn` if the resolved option is `Some`, otherwise returns `this` as `Some`
     *
     * `fn` *must not* fail and therefor have to return a `T2` or `PromiseLike<T2>`.
     */
    orElse<T2>(fn: () => T2 | PromiseLike<T2>): AsyncOption<T | T2>;

    orNull(): PromiseLike<T | null>;
    orUndefined(): PromiseLike<T | undefined>;

    /**
     * Returns a `Promise` of the contained `Some` value.
     *
     * @throws {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error Error} if the option is `None`
     */
    unwrap(): PromiseLike<T>;
}

export interface AsyncSome<T> extends Omit<AsyncOption<T>, 'then'>, PromiseLike<Some<T>> {}
export interface AsyncNone extends Omit<AsyncOption<never>, 'then'>, PromiseLike<None> {}

export class AsyncOptionImpl<T> implements AsyncOption<T> {
    constructor(private readonly _promise: PromiseLike<Option<T>>) {}

    then<TOption1 = Option<T>, TOption2 = never>(
        onfulfilled?: ((value: Option<T>) => TOption1 | PromiseLike<TOption1>) | null | undefined,
        onrejected?: ((reason: any) => TOption2 | PromiseLike<TOption2>) | null | undefined
    ): PromiseLike<TOption1 | TOption2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    and<T2>(fn: (val: T) => Some<T2>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Some<T2>>): AsyncOption<T2>;
    and(fn: (val: T) => None): AsyncNone;
    and(fn: (val: T) => PromiseLike<None>): AsyncNone;
    and<T2>(fn: (val: T) => Option<T2>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T2>;
    and<T2>(fn: (val: T) => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T2> {
        return new AsyncOptionImpl(
            this._promise.then(option => {
                const r = option.and<T2>(fn);
                return r;
            })
        );
    }

    or<T2>(fn: () => Some<T2>): AsyncSome<T | T2>;
    or<T2>(fn: () => PromiseLike<Some<T2>>): AsyncSome<T | T2>;
    or(fn: () => None): AsyncOption<T>;
    or(fn: () => PromiseLike<None>): AsyncOption<T>;
    or<T2>(fn: () => PromiseLike<Option<T2>>): AsyncOption<T | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T | T2>;
    or<T2>(fn: () => Option<T2> | PromiseLike<Option<T2>>): AsyncOption<T | T2> {
        return new AsyncOptionImpl(
            this._promise.then(option => {
                const r = option.or(fn);
                return r;
            })
        );
    }

    map<T2>(fn: (val: T) => T2 | PromiseLike<T2>): AsyncOption<T2> {
        return new AsyncOptionImpl(
            this._promise.then(option => {
                const r = option.map<T2>(fn);
                return r;
            })
        );
    }

    orElse<T2>(fn: () => T2 | PromiseLike<T2>): AsyncOption<T | T2> {
        return new AsyncOptionImpl(
            this._promise.then(option => {
                const r = option.orElse<T2>(fn);
                return r;
            })
        );
    }

    async unwrap(): Promise<T> {
        return (await this._promise).unwrap();
    }

    async orNull(): Promise<T | null> {
        return (await this._promise).orNull();
    }

    async orUndefined(): Promise<T | undefined> {
        return (await this._promise).orUndefined();
    }
}
