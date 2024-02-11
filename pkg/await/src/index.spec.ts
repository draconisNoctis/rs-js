import assert from 'node:assert';
import { describe, it } from 'node:test';
import './index';

describe('Promise.await', () => {
    it('should patch "await" onto Promise', () => {
        assert(Promise.resolve(null).await);
    });
});
