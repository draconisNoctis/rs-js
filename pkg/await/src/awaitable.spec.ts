import { awaitable } from './awaitable';
import { it, describe, mock, expect } from 'bun:test';

describe('awaitable', () => {
    it('should return properties', async () => {
        expect(awaitable(Promise.resolve({ foo: 'bar' })).await.foo).toBeDefined;
        expect(await awaitable(Promise.resolve({ foo: 'bar' })).await.foo).toEqual('bar');
    });

    it('should call method', async () => {
        const method = mock((a: string) => a.length);
        const obj = { foo: method };
        expect(awaitable(Promise.resolve(obj)).await.foo).toBeDefined;
        expect(await awaitable(Promise.resolve(obj)).await.foo('foobar')).toEqual(6);
        expect(method.mock.calls.length).toEqual(1);
        expect(method.mock.calls[0]).toEqual(['foobar']);
    });

    it('should call method with correct context', async () => {
        const obj = {
            _foo: 5,
            foo() {
                return this._foo;
            }
        };
        expect(awaitable(Promise.resolve(obj)).await.foo).toBeDefined;
        expect(await awaitable(Promise.resolve(obj)).await.foo()).toEqual(5);
    });

    it('should call method with overwritten context', async () => {
        const obj = {
            _foo: 5,
            foo() {
                return this._foo;
            }
        };
        expect(await awaitable(Promise.resolve(obj)).await.foo.call({ _foo: 3 })).toEqual(3);
    });
});
