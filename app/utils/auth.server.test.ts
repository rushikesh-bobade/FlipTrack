import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSessionValid, formatSessionCookie } from './auth.server';

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1).getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates unexpired session correctly', () => {
    const expiresAt = new Date(2026, 0, 2).getTime();
    expect(isSessionValid(expiresAt)).toBe(true);
  });

  it('invalidates expired session correctly', () => {
    const expiresAt = new Date(2025, 0, 1).getTime();
    expect(isSessionValid(expiresAt)).toBe(false);
  });

  it('formats session cookie string correctly', () => {
    const cookie = formatSessionCookie('abc-123');
    expect(cookie).toBe('session_id=abc-123; HttpOnly; Secure; Path=/');
  });
});
