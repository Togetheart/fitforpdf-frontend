import { describe, expect, test } from 'vitest';

describe('test environment polyfills', () => {
  test('requestAnimationFrame is available on window and global', () => {
    expect(typeof window.requestAnimationFrame).toBe('function');
    expect(typeof window.cancelAnimationFrame).toBe('function');
    expect(typeof globalThis.requestAnimationFrame).toBe('function');
    expect(typeof globalThis.cancelAnimationFrame).toBe('function');
  });
});
