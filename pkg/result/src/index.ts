import { AsyncResult, AsyncResultImpl } from './async-result';
import { Result, ResultImpl } from './result';

export { AsyncErr, AsyncOk, AsyncResult } from './async-result';
export { Err, Ok, Result } from './result';

export function isResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> | AsyncResult<T, E> {
    return val instanceof ResultImpl || val instanceof AsyncResultImpl;
}

export function isSyncResult<T = unknown, E = unknown>(val: Result<T, E> | AsyncResult<T, E>): val is Result<T, E>;
export function isSyncResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E>;
export function isSyncResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> {
    return val instanceof ResultImpl;
}

export function isAsyncResult<T = unknown, E = unknown>(val: Result<T, E> | AsyncResult<T, E>): val is AsyncResult<T, E>;
export function isAsyncResult<T = unknown, E = unknown>(val: unknown): val is AsyncResult<T, E>;
export function isAsyncResult<T = unknown, E = unknown>(val: unknown): val is AsyncResult<T, E> {
    return val instanceof AsyncResultImpl;
}
