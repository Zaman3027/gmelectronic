import { describe, it, expect } from 'vitest';
import { inquirySchema, DEVICE_TYPES } from '../src/schemas.js';

describe('inquirySchema (unit)', () => {
  const valid = {
    name: 'Rahim',
    phone: '+8801700000000',
    email: 'rahim@example.com',
    deviceType: 'Television',
    message: 'No picture, has sound.',
  };

  it('accepts a fully valid inquiry', () => {
    const result = inquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts a valid inquiry without an email', () => {
    const { email, ...noEmail } = valid;
    void email;
    const result = inquirySchema.safeParse(noEmail);
    expect(result.success).toBe(true);
  });

  it('accepts an empty-string email (optional)', () => {
    const result = inquirySchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace on strings', () => {
    const result = inquirySchema.parse({ ...valid, name: '  Karim  ' });
    expect(result.name).toBe('Karim');
  });

  it('rejects a missing name', () => {
    const result = inquirySchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it('rejects an invalid email', () => {
    const result = inquirySchema.safeParse({ ...valid, email: 'nope' });
    expect(result.success).toBe(false);
  });

  it('rejects a device type outside the enum', () => {
    const result = inquirySchema.safeParse({ ...valid, deviceType: 'Fridge' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty message', () => {
    const result = inquirySchema.safeParse({ ...valid, message: '' });
    expect(result.success).toBe(false);
  });

  it('accepts every declared device type', () => {
    for (const deviceType of DEVICE_TYPES) {
      const result = inquirySchema.safeParse({ ...valid, deviceType });
      expect(result.success).toBe(true);
    }
  });
});
