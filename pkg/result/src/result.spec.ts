import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Err, Ok } from './index';

describe('Result', () => {
    describe('isOk', () => {
        it('should identify Ok result', () => {
            assert(Ok(1).isOk());
            assert(!Ok(1).isErr());
        });
    });

    describe('isErr', () => {
        it('should identify Err result', () => {
            assert(Err(1).isErr());
            assert(!Err(1).isOk());
        });
    });

    describe('andThen', () => {
        it('should return mapped Ok for outer Ok', () => {
            assert.deepEqual(
                Ok(1).andThen(() => Ok(2)),
                Ok(2)
            );
        });

        it('should return mapped Ok for outer Ok (async)', async () => {
            assert(
                typeof Reflect.get(
                    Ok(1).andThen(async () => Ok(2)),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Ok(1).andThen(async () => Ok(2)), Ok(2));
        });

        it('should return mapped Err for outer Ok', () => {
            assert.deepEqual(
                Ok(1).andThen(() => Err('err')),
                Err('err')
            );
        });

        it('should return mapped Err for outer Ok (async)', async () => {
            assert(
                typeof Reflect.get(
                    Ok(1).andThen(async () => Err('err')),
                    'then'
                ) === 'function'
            );
            assert.deepEqual(await Ok(1).andThen(async () => Err('err')), Err('err'));
        });

        it('should return outer Err for outer Err', () => {
            assert.deepEqual(
                Err('outer-err').andThen(() => Ok(2)),
                Err('outer-err')
            );
            assert.deepEqual(
                Err('outer-err').andThen(() => Err('inner-err')),
                Err('outer-err')
            );
        });

        it('should return outer Err for outer Err (async)', async () => {
            assert(
                typeof Reflect.get(
                    Err('outer-err').andThen(async () => Ok(2)),
                    'then'
                ) !== 'function'
            );
            assert(
                typeof Reflect.get(
                    Err('outer-err').andThen(async () => Err('inner-err')),
                    'then'
                ) !== 'function'
            );
            assert.deepEqual(await Err('outer-err').andThen(async () => Ok(2)), Err('outer-err'));
            assert.deepEqual(await Err('outer-err').andThen(async () => Err('inner-err')), Err('outer-err'));
        });
    });

    describe('orElse', () => {
        it('should return mapped Ok for outer Err', () => {
            assert.deepEqual(
                Err(1).orElse(() => Ok(2)),
                Ok(2)
            );
        });

        it('should return mapped Ok for outer Err (async)', async () => {
            assert.deepEqual(await Err(1).orElse(async () => Ok(2)), Ok(2));
        });

        it('should return mapped Err for outer Err', () => {
            assert.deepEqual(
                Err(1).orElse(() => Err('err')),
                Err('err')
            );
        });

        it('should return mapped Err for outer Err (async)', async () => {
            assert.deepEqual(await Err(1).orElse(async () => Err('err')), Err('err'));
        });

        it('should return outer Err for outer Ok', () => {
            assert.deepEqual(
                Ok(1).orElse(() => Ok(2)),
                Ok(1)
            );
            assert.deepEqual(
                Ok(1).orElse(() => Err('inner-err')),
                Ok(1)
            );
        });

        it('should return outer Ok for outer Ok (async)', async () => {
            assert(
                typeof Reflect.get(
                    Ok(1).orElse(async () => Ok(2)),
                    'then'
                ) !== 'function'
            );
            assert(
                typeof Reflect.get(
                    Ok(1).orElse(async () => Err('inner-err')),
                    'then'
                ) !== 'function'
            );
            assert.deepEqual(await Ok(1).orElse(async () => Ok(2)), Ok(1));
            assert.deepEqual(await Ok(1).orElse(async () => Err('inner-err')), Ok(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Ok', () => {
            assert.deepEqual(
                Ok(1).map(() => 2),
                Ok(2)
            );
        });

        it('should return mapped value for outer Ok (async)', async () => {
            assert.deepEqual(await Ok(1).map(async () => 2), Ok(2));
        });

        it('should return outer error for outer Err', () => {
            assert.deepEqual(
                Err(1).map(() => 2),
                Err(1)
            );
        });

        it('should return outer error for outer Err (async)', async () => {
            assert.deepEqual(await Err(1).map(async () => 2), Err(1));
        });
    });

    describe('mapErr', () => {
        it('should return mapped error for outer Err', () => {
            assert.deepEqual(
                Err(1).mapErr(() => 2),
                Err(2)
            );
        });

        it('should return mapped error for outer Err (async)', async () => {
            assert.deepEqual(await Err(1).mapErr(async () => 2), Err(2));
        });

        it('should return outer ok for outer Ok', () => {
            assert.deepEqual(
                Ok(1).mapErr(() => 2),
                Ok(1)
            );
        });

        it('should return outer ok for outer Ok (async)', async () => {
            assert.deepEqual(await Ok(1).mapErr(async () => 2), Ok(1));
        });
    });

    describe('unwrap', () => {
        it('should unwrap Ok value', () => {
            assert.equal(Ok(1).unwrap(), 1);
        });

        it('should throw error on Err value', () => {
            assert.throws(() => Err('err').unwrap(), /Tried to unwrap Err: err\n/);
        });
    });

    describe('unwrapErr', () => {
        it('should unwrap Err value', () => {
            assert.equal(Err('err').unwrapErr(), 'err');
        });

        it('should throw error on Ok value', () => {
            assert.throws(() => Ok(1).unwrapErr(), /Tried to unwrap Ok: 1/);
        });
    });

    describe('Err', () => {
        it('should have error property', () => {
            assert.equal(Err('err').error, 'err');
        });

        it('should have stack property', () => {
            assert(typeof Err('err').stack === 'string');
        });

        it('should have internals in Stack', () => {
            assert.doesNotMatch(Err('err').stack, /result\.(t|j)s/);
        });
    });
});
