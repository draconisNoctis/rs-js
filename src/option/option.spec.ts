import { describe, it } from 'node:test';
import assert from 'node:assert';
import { None, Some } from './index';

describe('Option', () => {
    describe('isSome', () => {
        it('should identify Ok result', () => {
            assert(Some(1).isSome());
            assert(!Some(1).isNone());
        });
    });

    describe('isNone', () => {
        it('should identify Err result', () => {
            assert(None.isNone());
            assert(!None.isSome());
        });
    });

    describe('and', () => {
        it('should return mapped Some for outer Some', () => {
            assert.deepEqual(
                Some(1).and(() => Some(2)),
                Some(2)
            );
        });

        it('should return mapped Some for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    Some(1).and(async () => Some(2)),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Some(1).and(async () => Some(2)), Some(2));
        });

        it('should return mapped None for outer Some', () => {
            assert.deepEqual(
                Some(1).and(() => None),
                None
            );
        });

        it('should return mapped None for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    Some(1).and(async () => None),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Some(1).and(async () => None), None);
        });

        it('should return outer None for outer None', () => {
            assert.deepEqual(
                None.and(() => Some(2)),
                None
            );
            assert.deepEqual(
                None.and(() => None),
                None
            );
        });

        it('should return outer Err for outer Err (async)', async () => {
            assert(
                typeof Reflect.get(
                    None.and(async () => Some(2)),
                    'then'
                ) !== 'function'
            );
            assert(
                typeof Reflect.get(
                    None.and(async () => None),
                    'then'
                ) !== 'function'
            );
            assert.deepEqual(await None.and(async () => Some(2)), None);
            assert.deepEqual(await None.and(async () => None), None);
        });
    });

    describe('or', () => {
        it('should return mapped Some for outer None', () => {
            assert.deepEqual(
                None.or(() => Some(2)),
                Some(2)
            );
        });

        it('should return mapped Some for outer None (async)', async () => {
            assert.deepEqual(await None.or(async () => Some(2)), Some(2));
        });

        it('should return mapped None for outer None', () => {
            assert.deepEqual(
                None.or(() => None),
                None
            );
        });

        it('should return mapped None for outer None (async)', async () => {
            assert.deepEqual(await None.or(async () => None), None);
        });

        it('should return outer None for outer Some', () => {
            assert.deepEqual(
                Some(1).or(() => Some(2)),
                Some(1)
            );
            assert.deepEqual(
                Some(1).or(() => None),
                Some(1)
            );
        });

        it('should return outer Some for outer Some (async)', async () => {
            assert(
                typeof Reflect.get(
                    Some(1).or(async () => Some(2)),
                    'then'
                ) !== 'function'
            );
            assert(
                typeof Reflect.get(
                    Some(1).or(async () => None),
                    'then'
                ) !== 'function'
            );
            assert.deepEqual(await Some(1).or(async () => Some(2)), Some(1));
            assert.deepEqual(await Some(1).or(async () => None), Some(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Some', () => {
            assert.deepEqual(
                Some(1).map(() => 2),
                Some(2)
            );
        });

        it('should return mapped value for outer Some (async)', async () => {
            assert.deepEqual(await Some(1).map(async () => 2), Some(2));
        });

        it('should return outer None for outer None', () => {
            assert.deepEqual(
                None.map(() => 2),
                None
            );
        });

        it('should return outer None for outer None (async)', async () => {
            assert.deepEqual(await None.map(async () => 2), None);
        });
    });

    describe('orElse', () => {
        it('should return mapped Some for outer None', () => {
            assert.deepEqual(
                None.orElse(() => 2),
                Some(2)
            );
        });

        it('should return mapped Some for outer None (async)', async () => {
            assert.deepEqual(await None.orElse(async () => 2), Some(2));
        });

        it('should return outer Some for outer Some', () => {
            assert.deepEqual(
                Some(1).orElse(() => 2),
                Some(1)
            );
        });

        it('should return outer some for outer Some (async)', async () => {
            assert.deepEqual(await Some(1).orElse(async () => 2), Some(1));
        });
    });

    describe('orNull', () => {
        it('should return mapped value for Some', () => {
            assert.equal(Some(2).orNull(), 2);
        });

        it('should return null for None', () => {
            assert.equal(None.orNull(), null);
        });
    });

    describe('orUndefined', () => {
        it('should return mapped value for Some', () => {
            assert.equal(Some(2).orUndefined(), 2);
        });

        it('should return undefined for None', () => {
            assert.equal(None.orUndefined(), undefined);
        });
    });

    describe('unwrap', () => {
        it('should unwrap Some value', () => {
            assert.equal(Some(1).unwrap(), 1);
        });

        it('should throw error on None value', () => {
            assert.throws(() => None.unwrap(), /Tried to unwrap None/);
        });
    });
});
