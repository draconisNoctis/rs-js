import { AsyncOption, AsyncOptionImpl } from './async-option';
import { Option, SomeImpl, NoneImpl } from './option';

export { AsyncNone, AsyncSome, AsyncOption } from './async-option';
export { Some, None, Option } from './option';

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
