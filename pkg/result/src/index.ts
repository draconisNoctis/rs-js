import { AsyncResult, AsyncResultImpl } from './async-result';
import { ErrImpl, OkImpl, Result } from './result';

export { AsyncErr, AsyncOk, AsyncResult } from './async-result';
export { Err, ErrImpl, IResult, Ok, OkImpl, Result } from './result';

export function isResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> | AsyncResult<T, E> {
    return val instanceof OkImpl || val instanceof ErrImpl || val instanceof AsyncResultImpl;
}

export function isSyncResult<T = unknown, E = unknown>(val: Result<T, E> | AsyncResult<T, E>): val is Result<T, E>;
export function isSyncResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E>;
export function isSyncResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> {
    return val instanceof OkImpl || val instanceof ErrImpl;
}

export function isAsyncResult<T = unknown, E = unknown>(val: Result<T, E> | AsyncResult<T, E>): val is AsyncResult<T, E>;
export function isAsyncResult<T = unknown, E = unknown>(val: unknown): val is AsyncResult<T, E>;
export function isAsyncResult<T = unknown, E = unknown>(val: unknown): val is AsyncResult<T, E> {
    return val instanceof AsyncResultImpl;
}
