import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitInquiry, ApiError } from '../src/api';

const payload = {
  name: 'Rahim',
  phone: '+8801700000000',
  email: 'rahim@example.com',
  deviceType: 'Television',
  message: 'No picture.',
};

describe('submitInquiry (unit)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs to /api/inquiries and returns the created record', async () => {
    const created = { id: 1, ...payload, createdAt: '2026-01-01' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => created,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInquiry(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/inquiries',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(created);
  });

  it('throws ApiError with details on a 400 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'ValidationError',
        details: { name: ['Name is required'] },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitInquiry(payload)).rejects.toBeInstanceOf(ApiError);
    try {
      await submitInquiry(payload);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      if (err instanceof ApiError) {
        expect(err.message).toBe('ValidationError');
        expect(err.details?.name).toEqual(['Name is required']);
      }
    }
  });
});
