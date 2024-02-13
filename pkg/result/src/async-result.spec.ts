import { describe, it, expect } from 'bun:test';
import { AsyncResultImpl } from './async-result';
import { Err, Ok } from './result';

describe('AsyncResult', () => {
    describe('andThen', () => {
        it('should return mapped Ok for outer Ok', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(() => Ok(2))).toEqual(Ok(2));
        });
        it('should return mapped Ok for outer Ok (async)', async () => {
            expect(AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(async () => Ok(2)).then).toBeTypeOf('function');
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(async () => Ok(2))).toEqual(Ok(2));
        });
        it('should return mapped Err for outer Ok', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(() => Err('err'))).toEqual(Err('err'));
        });
        it('should return mapped Err for outer Ok (async)', async () => {
            expect(AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(async () => Err('err')).then).toBeTypeOf('function');
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).andThen(async () => Err('err'))).toEqual(Err('err'));
        });
        it('should return outer Err for outer Err', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(() => Ok(2))).toEqual(Err('outer-err'));
            expect(await AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(() => Err('inner-err'))).toEqual(
                Err('outer-err')
            );
        });
        it('should return outer Err for outer Err (async)', async () => {
            expect(AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(async () => Ok(2)).then).toBeTypeOf('function');
            expect(AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(async () => Err('inner-err')).then).toBeTypeOf(
                'function'
            );
            expect(await AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(async () => Ok(2))).toEqual(Err('outer-err'));
            expect(await AsyncResultImpl.create(Promise.resolve(Err('outer-err'))).andThen(async () => Err('inner-err'))).toEqual(
                Err('outer-err')
            );
        });
    });

    describe('orElse', () => {
        it('should return mapped Ok for outer Err', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).orElse(() => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Ok for outer Err (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).orElse(async () => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Err for outer Err', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).orElse(() => Err('err'))).toEqual(Err('err'));
        });

        it('should return mapped Err for outer Err (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).orElse(async () => Err('err'))).toEqual(Err('err'));
        });

        it('should return outer Err for outer Ok', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(() => Ok(2))).toEqual(Ok(1));
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(() => Err('inner-err'))).toEqual(Ok(1));
        });

        it('should return outer Ok for outer Ok (async)', async () => {
            expect(AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(async () => Ok(2)).then).toBeTypeOf('function');
            expect(AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(async () => Err('inner-err')).then).toBeTypeOf('function');
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(async () => Ok(2))).toEqual(Ok(1));
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).orElse(async () => Err('inner-err'))).toEqual(Ok(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Ok', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).map(() => 2)).toEqual(Ok(2));
        });

        it('should return mapped value for outer Ok (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).map(async () => 2)).toEqual(Ok(2));
        });

        it('should return outer error for outer Err', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).map(() => 2)).toEqual(Err(1));
        });

        it('should return outer error for outer Err (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).map(async () => 2)).toEqual(Err(1));
        });
    });

    describe('mapErr', () => {
        it('should return mapped error for outer Err', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).mapErr(() => 2)).toEqual(Err(2));
        });

        it('should return mapped error for outer Err (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err(1))).mapErr(async () => 2)).toEqual(Err(2));
        });

        it('should return outer ok for outer Ok', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).mapErr(() => 2)).toEqual(Ok(1));
        });

        it('should return outer ok for outer Ok (async)', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).mapErr(async () => 2)).toEqual(Ok(1));
        });
    });

    describe('unwrap', () => {
        it('should unwrap Ok value', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Ok(1))).unwrap()).toEqual(1);
        });

        it('should throw error on Err value', async () => {
            expect(AsyncResultImpl.create(Promise.resolve(Err('err'))).unwrap()).rejects.toThrow(/Tried to unwrap Err: err\n/);
        });
    });

    describe('unwrapErr', () => {
        it('should unwrap Err value', async () => {
            expect(await AsyncResultImpl.create(Promise.resolve(Err('err'))).unwrapErr()).toEqual('err');
        });

        it('should throw error on Ok value', async () => {
            await expect(AsyncResultImpl.create(Promise.resolve(Ok(1))).unwrapErr()).rejects.toThrow(/Tried to unwrap Ok: 1/);
        });
    });
});
