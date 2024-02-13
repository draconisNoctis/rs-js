import { describe, it, expect } from 'bun:test';
import './index';

describe('Promise.await', () => {
    it('should patch "await" onto Promise', () => {
        expect(Promise.resolve(null).await).toBeDefined();
    });
});
