import { describe, it, expect } from 'bun:test';

import { AsyncSome, AsyncNone, AsyncOptionImpl } from './async-option';
import { None, Some } from './option';

function createAsyncSome<T>(value: T): AsyncSome<T> {
    return AsyncOptionImpl.create(Promise.resolve(Some(value))) as AsyncSome<T>;
}
function createAsyncNone(): AsyncNone {
    return AsyncOptionImpl.create(Promise.resolve(None)) as AsyncNone;
}

describe('AsyncOption', () => {
    describe('and', () => {
        it('should return mapped Some for outer Some', async () => {
            expect(await createAsyncSome(1).and(() => Some(2))).toEqual(Some(2));
        });

        it('should return mapped Some for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    createAsyncSome(1).and(async () => Some(2)),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Some(1).and(async () => Some(2))).toEqual(Some(2));
        });

        it('should return mapped None for outer Some', async () => {
            expect(await createAsyncSome(1).and(() => None)).toEqual(None);
        });

        it('should return mapped None for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    createAsyncSome(1).and(async () => None),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Some(1).and(async () => None)).toEqual(None);
        });

        it('should return outer None for outer None', async () => {
            expect(await createAsyncNone().and(() => Some(2))).toEqual(None);
            expect(await createAsyncNone().and(() => None)).toEqual(None);
        });

        it('should return outer None for outer None (async)', async () => {
            expect(
                Reflect.get(
                    createAsyncNone().and(async () => Some(2)),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(
                Reflect.get(
                    createAsyncNone().and(async () => None),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await createAsyncNone().and(async () => Some(2))).toEqual(None);
            expect(await createAsyncNone().and(async () => None)).toEqual(None);
        });
    });

    describe('or', () => {
        it('should return mapped Some for outer None', async () => {
            expect(await createAsyncNone().or(() => Some(2))).toEqual(Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            expect(await None.or(async () => Some(2))).toEqual(Some(2));
        });

        it('should return mapped None for outer None', async () => {
            expect(await createAsyncNone().or(() => None)).toEqual(None);
        });

        it('should return mapped None for outer None (async)', async () => {
            expect(await createAsyncNone().or(async () => None)).toEqual(None);
        });

        it('should return outer None for outer Some', async () => {
            expect(await createAsyncSome(1).or(() => Some(2))).toEqual(Some(1));
            expect(await createAsyncSome(1).or(() => None)).toEqual(Some(1));
        });

        it('should return outer Some for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    createAsyncSome(1).or(async () => Some(2)),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(
                Reflect.get(
                    createAsyncSome(1).or(async () => None),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await createAsyncSome(1).or(async () => Some(2))).toEqual(Some(1));
            expect(await createAsyncSome(1).or(async () => None)).toEqual(Some(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Some', async () => {
            expect(await createAsyncSome(1).map(() => 2)).toEqual(Some(2));
        });

        it('should return mapped value for outer Some (async)', async () => {
            expect(await createAsyncSome(1).map(async () => 2)).toEqual(Some(2));
        });

        it('should return outer None for outer None', async () => {
            expect(await createAsyncNone().map(() => 2)).toEqual(None);
        });

        it('should return outer None for outer None (async)', async () => {
            expect(await createAsyncNone().map(async () => 2)).toEqual(None);
        });
    });

    describe('orElse', () => {
        it('should return mapped Some for outer None', async () => {
            expect(await createAsyncNone().orElse(() => 2)).toEqual(Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            expect(await createAsyncNone().orElse(async () => 2)).toEqual(Some(2));
        });

        it('should return outer Some for outer Some', async () => {
            expect(await createAsyncSome(1).orElse(() => 2)).toEqual(Some(1));
        });

        it('should return outer some for outer Some (async)', async () => {
            expect(await createAsyncSome(1).orElse(async () => 2)).toEqual(Some(1));
        });
    });

    describe('orNull', () => {
        it('should return mapped value for Some', async () => {
            expect(await createAsyncSome(2).orNull()).toEqual(2);
        });

        it('should return null for None', async () => {
            expect(await createAsyncNone().orNull()).toBeNull();
        });
    });

    describe('orUndefined', () => {
        it('should return mapped value for Some', async () => {
            expect(await createAsyncSome(2).orUndefined()).toEqual(2);
        });

        it('should return undefined for None', async () => {
            expect(await createAsyncNone().orUndefined()).toBeUndefined();
        });
    });

    describe('unwrap', () => {
        it('should unwrap Some value', async () => {
            expect(await createAsyncSome(1).unwrap()).toEqual(1);
        });

        it('should throw error on None value', async () => {
            await expect(createAsyncNone().unwrap()).rejects.toThrow(/Tried to unwrap None/);
        });
    });
});
