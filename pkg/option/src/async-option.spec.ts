import assert from 'node:assert';
import { describe, it } from 'node:test';
import { AsyncNone, AsyncSome, AsyncOptionImpl } from './async-option';
import { None, Some } from './index';

function AsyncSome<T>(value: T): AsyncSome<T> {
    return AsyncOptionImpl.create(Promise.resolve(Some(value))) as AsyncSome<T>;
}
function AsyncNone(): AsyncNone {
    return AsyncOptionImpl.create(Promise.resolve(None)) as AsyncNone;
}

describe('AsyncOption', () => {
    describe('and', () => {
        it('should return mapped Some for outer Some', async () => {
            assert.deepEqual(await AsyncSome(1).and(() => Some(2)), Some(2));
        });

        it('should return mapped Some for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    AsyncSome(1).and(async () => Some(2)),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Some(1).and(async () => Some(2)), Some(2));
        });

        it('should return mapped None for outer Some', async () => {
            assert.deepEqual(await AsyncSome(1).and(() => None), None);
        });

        it('should return mapped None for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    AsyncSome(1).and(async () => None),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Some(1).and(async () => None), None);
        });

        it('should return outer None for outer None', async () => {
            assert.deepEqual(await AsyncNone().and(() => Some(2)), None);
            assert.deepEqual(await AsyncNone().and(() => None), None);
        });

        it('should return outer None for outer None (async)', async () => {
            assert(
                typeof Reflect.get(
                    AsyncNone().and(async () => Some(2)),
                    'then'
                ) === 'function'
            );
            assert(
                typeof Reflect.get(
                    AsyncNone().and(async () => None),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await AsyncNone().and(async () => Some(2)), None);
            assert.deepEqual(await AsyncNone().and(async () => None), None);
        });
    });

    describe('or', () => {
        it('should return mapped Some for outer None', async () => {
            assert.deepEqual(await AsyncNone().or(() => Some(2)), Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            assert.deepEqual(await None.or(async () => Some(2)), Some(2));
        });

        it('should return mapped None for outer None', async () => {
            assert.deepEqual(await AsyncNone().or(() => None), None);
        });

        it('should return mapped None for outer None (async)', async () => {
            assert.deepEqual(await AsyncNone().or(async () => None), None);
        });

        it('should return outer None for outer Some', async () => {
            assert.deepEqual(await AsyncSome(1).or(() => Some(2)), Some(1));
            assert.deepEqual(await AsyncSome(1).or(() => None), Some(1));
        });

        it('should return outer Some for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    AsyncSome(1).or(async () => Some(2)),
                    'then'
                ) === 'function'
            );
            assert(
                typeof Reflect.get(
                    AsyncSome(1).or(async () => None),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await AsyncSome(1).or(async () => Some(2)), Some(1));
            assert.deepEqual(await AsyncSome(1).or(async () => None), Some(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Some', async () => {
            assert.deepEqual(await AsyncSome(1).map(() => 2), Some(2));
        });

        it('should return mapped value for outer Some (async)', async () => {
            assert.deepEqual(await AsyncSome(1).map(async () => 2), Some(2));
        });

        it('should return outer None for outer None', async () => {
            assert.deepEqual(await AsyncNone().map(() => 2), None);
        });

        it('should return outer None for outer None (async)', async () => {
            assert.deepEqual(await AsyncNone().map(async () => 2), None);
        });
    });

    describe('orElse', () => {
        it('should return mapped Some for outer None', async () => {
            assert.deepEqual(await AsyncNone().orElse(() => 2), Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            assert.deepEqual(await AsyncNone().orElse(async () => 2), Some(2));
        });

        it('should return outer Some for outer Some', async () => {
            assert.deepEqual(await AsyncSome(1).orElse(() => 2), Some(1));
        });

        it('should return outer some for outer Some (async)', async () => {
            assert.deepEqual(await AsyncSome(1).orElse(async () => 2), Some(1));
        });
    });

    describe('orNull', () => {
        it('should return mapped value for Some', async () => {
            assert.equal(await AsyncSome(2).orNull(), 2);
        });

        it('should return null for None', async () => {
            assert.equal(await AsyncNone().orNull(), null);
        });
    });

    describe('orUndefined', () => {
        it('should return mapped value for Some', async () => {
            assert.equal(await AsyncSome(2).orUndefined(), 2);
        });

        it('should return undefined for None', async () => {
            assert.equal(await AsyncNone().orUndefined(), undefined);
        });
    });

    describe('unwrap', () => {
        it('should unwrap Some value', async () => {
            assert.equal(await AsyncSome(1).unwrap(), 1);
        });

        it('should throw error on None value', async () => {
            await assert.rejects(AsyncNone().unwrap(), /Tried to unwrap None/);
        });
    });
});
