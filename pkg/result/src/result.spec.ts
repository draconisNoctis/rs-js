import { describe, it, expect } from 'bun:test';
import { Err, Ok } from './result';

describe('Result', () => {
    describe('isOk', () => {
        it('should identify Ok result', () => {
            expect(Ok(1).isOk()).toBeTrue();
            expect(!Ok(1).isErr()).toBeTrue();
        });
    });

    describe('isErr', () => {
        it('should identify Err result', () => {
            expect(Err(1).isErr()).toBeTrue();
            expect(!Err(1).isOk()).toBeTrue();
        });
    });

    describe('andThen', () => {
        it('should return mapped Ok for outer Ok', () => {
            expect(Ok(1).andThen(() => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Ok for outer Ok (async)', async () => {
            expect(
                Reflect.get(
                    Ok(1).andThen(async () => Ok(2)),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Ok(1).andThen(async () => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Err for outer Ok', () => {
            expect(Ok(1).andThen(() => Err('err'))).toEqual(Err('err'));
        });

        it('should return mapped Err for outer Ok (async)', async () => {
            expect(
                Reflect.get(
                    Ok(1).andThen(async () => Err('err')),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Ok(1).andThen(async () => Err('err'))).toEqual(Err('err'));
        });

        it('should return outer Err for outer Err', () => {
            expect(Err('outer-err').andThen(() => Ok(2))).toEqual(Err('outer-err'));
            expect(Err('outer-err').andThen(() => Err('inner-err'))).toEqual(Err('outer-err'));
        });

        it('should return outer Err for outer Err (async)', async () => {
            expect(
                Reflect.get(
                    Err('outer-err').andThen(async () => Ok(2)),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(
                Reflect.get(
                    Err('outer-err').andThen(async () => Err('inner-err')),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(await Err('outer-err').andThen(async () => Ok(2))).toEqual(Err('outer-err'));
            expect(await Err('outer-err').andThen(async () => Err('inner-err'))).toEqual(Err('outer-err'));
        });
    });

    describe('orElse', () => {
        it('should return mapped Ok for outer Err', () => {
            expect(Err(1).orElse(() => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Ok for outer Err (async)', async () => {
            expect(await Err(1).orElse(async () => Ok(2))).toEqual(Ok(2));
        });

        it('should return mapped Err for outer Err', () => {
            expect(Err(1).orElse(() => Err('err'))).toEqual(Err('err'));
        });

        it('should return mapped Err for outer Err (async)', async () => {
            expect(await Err(1).orElse(async () => Err('err'))).toEqual(Err('err'));
        });

        it('should return outer Err for outer Ok', () => {
            expect(Ok(1).orElse(() => Ok(2))).toEqual(Ok(1));
            expect(Ok(1).orElse(() => Err('inner-err'))).toEqual(Ok(1));
        });

        it('should return outer Ok for outer Ok (async)', async () => {
            expect(
                Reflect.get(
                    Ok(1).orElse(async () => Ok(2)),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(
                Reflect.get(
                    Ok(1).orElse(async () => Err('inner-err')),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(await Ok(1).orElse(async () => Ok(2))).toEqual(Ok(1));
            expect(await Ok(1).orElse(async () => Err('inner-err'))).toEqual(Ok(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Ok', () => {
            expect(Ok(1).map(() => 2)).toEqual(Ok(2));
        });

        it('should return mapped value for outer Ok (async)', async () => {
            expect(await Ok(1).map(async () => 2)).toEqual(Ok(2));
        });

        it('should return outer error for outer Err', () => {
            expect(Err(1).map(() => 2)).toEqual(Err(1));
        });

        it('should return outer error for outer Err (async)', async () => {
            expect(await Err(1).map(async () => 2)).toEqual(Err(1));
        });
    });

    describe('mapErr', () => {
        it('should return mapped error for outer Err', () => {
            expect(Err(1).mapErr(() => 2)).toEqual(Err(2));
        });

        it('should return mapped error for outer Err (async)', async () => {
            expect(await Err(1).mapErr(async () => 2)).toEqual(Err(2));
        });

        it('should return outer ok for outer Ok', () => {
            expect(Ok(1).mapErr(() => 2)).toEqual(Ok(1));
        });

        it('should return outer ok for outer Ok (async)', async () => {
            expect(await Ok(1).mapErr(async () => 2)).toEqual(Ok(1));
        });
    });

    describe('unwrap', () => {
        it('should unwrap Ok value', () => {
            expect(Ok(1).unwrap()).toEqual(1);
        });

        it('should throw error on Err value', () => {
            expect(() => Err('err').unwrap()).toThrow(/Tried to unwrap Err: err\n/);
        });
    });

    describe('safeUnwrap', () => {
        it('should unwrap Ok value', () => {
            expect(Ok(1).safeUnwrap()).toEqual(1);
        });
    });

    describe('unwrapErr', () => {
        it('should unwrap Err value', () => {
            expect(Err('err').unwrapErr()).toEqual('err');
        });

        it('should throw error on Ok value', () => {
            expect(() => Ok(1).unwrapErr()).toThrow(/Tried to unwrap Ok: 1/);
        });
    });

    describe('Err', () => {
        it('should have error property', () => {
            expect(Err('err').error).toEqual('err');
        });

        it('should have stack property', () => {
            expect(Err('err').stack).toBeTypeOf('string');
        });

        it('should not have internals in Stack', () => {
            expect(Err('err').stack).not.toMatch(/result\.(t|j)s/);
        });
    });
});
