import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInquiry,
  getInquiry,
  listInquiries,
  clearInquiries,
} from '../src/db.js';

const base = {
  name: 'Rahim',
  phone: '+8801700000000',
  email: 'rahim@example.com',
  deviceType: 'Television',
  message: 'No picture, has sound.',
};

describe('db layer (unit)', () => {
  beforeEach(() => {
    clearInquiries();
  });

  it('creates an inquiry and returns it with an id and timestamp', () => {
    const row = createInquiry(base);
    expect(row.id).toBe(1);
    expect(row.name).toBe('Rahim');
    expect(row.deviceType).toBe('Television');
    expect(row.createdAt).toBeTruthy();
  });

  it('stores null email when omitted', () => {
    const row = createInquiry({ ...base, email: '' });
    expect(row.email).toBeNull();
  });

  it('fetches an inquiry by id', () => {
    const created = createInquiry(base);
    const fetched = getInquiry(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(created.id);
  });

  it('returns undefined for a missing id', () => {
    expect(getInquiry(9999)).toBeUndefined();
  });

  it('lists inquiries newest-first', () => {
    createInquiry({ ...base, name: 'First' });
    createInquiry({ ...base, name: 'Second' });
    const items = listInquiries();
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Second');
    expect(items[1].name).toBe('First');
  });

  it('respects limit and offset', () => {
    for (let i = 0; i < 5; i++) {
      createInquiry({ ...base, name: `N${i}` });
    }
    const page = listInquiries({ limit: 2, offset: 1 });
    expect(page).toHaveLength(2);
  });
});
