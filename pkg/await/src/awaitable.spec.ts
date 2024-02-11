import { awaitable } from './awaitable';
import { it, describe, mock } from 'node:test';
import assert from 'node:assert';

describe('awaitable', () => {
    it('should return properties', async () => {
        assert(awaitable(Promise.resolve({ foo: 'bar' })).await.foo);
        assert.equal(await awaitable(Promise.resolve({ foo: 'bar' })).await.foo, 'bar');
    });

    it('should call method', async () => {
        const method = mock.fn((a: string) => a.length);
        const obj = { foo: method };
        assert(awaitable(Promise.resolve(obj)).await.foo);
        assert.equal(await awaitable(Promise.resolve(obj)).await.foo('foobar'), 6);
        assert.equal(method.mock.calls.length, 1);
        assert.deepEqual(method.mock.calls[0].arguments, ['foobar']);
    });

    it('should call method with correct context', async () => {
        const obj = {
            _foo: 5,
            foo() {
                return this._foo;
            }
        };
        assert(awaitable(Promise.resolve(obj)).await.foo);
        assert.equal(await awaitable(Promise.resolve(obj)).await.foo(), 5);
    });

    it('should call method with overwritten context', async () => {
        const obj = {
            _foo: 5,
            foo() {
                return this._foo;
            }
        };
        assert.equal(await awaitable(Promise.resolve(obj)).await.foo.call({ _foo: 3 }), 3);
    });
});
