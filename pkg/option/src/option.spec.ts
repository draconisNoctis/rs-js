import { describe, it, expect } from 'bun:test';
import { None, Some } from './option';

describe('Option', () => {
    describe('isSome', () => {
        it('should identify Ok result', () => {
            expect(Some(1).isSome()).toBeTrue();
            expect(!Some(1).isNone()).toBeTrue();
        });
    });

    describe('isNone', () => {
        it('should identify Err result', () => {
            expect(None.isNone()).toBeTrue();
            expect(!None.isSome()).toBeTrue();
        });
    });

    describe('and', () => {
        it('should return mapped Some for outer Some', () => {
            expect(Some(1).and(() => Some(2))).toEqual(Some(2));
        });

        it('should return mapped Some for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    Some(1).and(async () => Some(2)),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Some(1).and(async () => Some(2))).toEqual(Some(2));
        });

        it('should return mapped None for outer Some', () => {
            expect(Some(1).and(() => None)).toEqual(None);
        });

        it('should return mapped None for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    Some(1).and(async () => None),
                    'then'
                )
            ).toBeTypeOf('function');
            expect(await Some(1).and(async () => None)).toEqual(None);
        });

        it('should return outer None for outer None', () => {
            expect(None.and(() => Some(2))).toEqual(None);
            expect(None.and(() => None)).toEqual(None);
        });

        it('should return outer Err for outer Err (async)', async () => {
            expect(
                Reflect.get(
                    None.and(async () => Some(2)),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(
                Reflect.get(
                    None.and(async () => None),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(await None.and(async () => Some(2))).toEqual(None);
            expect(await None.and(async () => None)).toEqual(None);
        });
    });

    describe('or', () => {
        it('should return mapped Some for outer None', () => {
            expect(None.or(() => Some(2))).toEqual(Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            expect(await None.or(async () => Some(2))).toEqual(Some(2));
        });

        it('should return mapped None for outer None', () => {
            expect(None.or(() => None)).toEqual(None);
        });

        it('should return mapped None for outer None (async)', async () => {
            expect(await None.or(async () => None)).toEqual(None);
        });

        it('should return outer None for outer Some', () => {
            expect(Some(1).or(() => Some(2))).toEqual(Some(1));
            expect(Some(1).or(() => None)).toEqual(Some(1));
        });

        it('should return outer Some for outer Some (async)', async () => {
            expect(
                Reflect.get(
                    Some(1).or(async () => Some(2)),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(
                Reflect.get(
                    Some(1).or(async () => None),
                    'then'
                )
            ).not.toBeTypeOf('function');
            expect(await Some(1).or(async () => Some(2))).toEqual(Some(1));
            expect(await Some(1).or(async () => None)).toEqual(Some(1));
        });
    });

    describe('map', () => {
        it('should return mapped value for outer Some', () => {
            expect(Some(1).map(() => 2)).toEqual(Some(2));
        });

        it('should return mapped value for outer Some (async)', async () => {
            expect(await Some(1).map(async () => 2)).toEqual(Some(2));
        });

        it('should return outer None for outer None', () => {
            expect(None.map(() => 2)).toEqual(None);
        });

        it('should return outer None for outer None (async)', async () => {
            expect(await None.map(async () => 2)).toEqual(None);
        });
    });

    describe('orElse', () => {
        it('should return mapped Some for outer None', () => {
            expect(None.orElse(() => 2)).toEqual(Some(2));
        });

        it('should return mapped Some for outer None (async)', async () => {
            expect(await None.orElse(async () => 2)).toEqual(Some(2));
        });

        it('should return outer Some for outer Some', () => {
            expect(Some(1).orElse(() => 2)).toEqual(Some(1));
        });

        it('should return outer some for outer Some (async)', async () => {
            expect(await Some(1).orElse(async () => 2)).toEqual(Some(1));
        });
    });

    describe('orNull', () => {
        it('should return mapped value for Some', () => {
            expect(Some(2).orNull()).toEqual(2);
        });

        it('should return null for None', () => {
            expect(None.orNull()).toBeNull();
        });
    });

    describe('orUndefined', () => {
        it('should return mapped value for Some', () => {
            expect(Some(2).orUndefined()).toEqual(2);
        });

        it('should return undefined for None', () => {
            expect(None.orUndefined()).toBeUndefined();
        });
    });

    describe('unwrap', () => {
        it('should unwrap Some value', () => {
            expect(Some(1).unwrap()).toEqual(1);
        });

        it('should throw error on None value', () => {
            expect(() => None.unwrap()).toThrow(/Tried to unwrap None/);
        });
    });
});
