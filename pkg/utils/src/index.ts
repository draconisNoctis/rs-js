export function toString(val: unknown): string {
    let value = String(val);
    if (value === '[object Object]') {
        try {
            value = JSON.stringify(val);
        } catch {}
    }
    return value;
}

export function isPromise<T>(val: unknown): val is PromiseLike<T> {
    return !!val && typeof val === 'object' && 'then' in val && typeof val.then === 'function';
}
