import { describe, expect, it } from 'vitest';
import { generateId } from '../src/id';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateId', () => {
  it('produces a valid UUIDv7', () => {
    expect(generateId()).toMatch(UUID_V7_PATTERN);
  });

  it('produces unique, monotonically increasing IDs across successive calls', () => {
    const ids = Array.from({ length: 20 }, () => generateId());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
