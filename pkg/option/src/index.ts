import { AsyncOption, AsyncOptionImpl } from './async-option';
import { NoneImpl, Option, SomeImpl } from './option';

export { AsyncNone, AsyncOption, AsyncSome } from './async-option';
export { IOption, None, NoneImpl, Option, Some, SomeImpl } from './option';

export function isOption<T = unknown>(val: unknown): val is Option<T> | AsyncOption<T> {
    return val instanceof SomeImpl || val instanceof NoneImpl || val instanceof AsyncOptionImpl;
}

export function isSyncOption<T = unknown>(val: Option<T> | AsyncOption<T>): val is Option<T>;
export function isSyncOption<T = unknown>(val: unknown): val is Option<T>;
export function isSyncOption<T = unknown>(val: unknown): val is Option<T> {
    return val instanceof SomeImpl || val instanceof NoneImpl;
}

export function isAsyncOption<T = unknown>(val: Option<T> | AsyncOption<T>): val is AsyncOption<T>;
export function isAsyncOption<T = unknown>(val: unknown): val is AsyncOption<T>;
export function isAsyncOption<T = unknown>(val: unknown): val is AsyncOption<T> {
    return val instanceof AsyncOptionImpl;
}
