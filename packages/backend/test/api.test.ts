import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { clearInquiries } from '../src/db.js';

const app = createApp();

const valid = {
  name: 'Rahim',
  phone: '+8801700000000',
  email: 'rahim@example.com',
  deviceType: 'Television',
  message: 'No picture, has sound.',
};

describe('API (integration)', () => {
  beforeEach(() => {
    clearInquiries();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/inquiries creates an inquiry (201)', async () => {
    const res = await request(app).post('/api/inquiries').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe('Rahim');
    expect(res.body.createdAt).toBeTruthy();
  });

  it('POST /api/inquiries rejects invalid input (400) with field errors', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .send({ name: '', phone: 'x', email: 'nope', deviceType: 'Fridge', message: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details.name).toBeDefined();
    expect(res.body.details.email).toBeDefined();
    expect(res.body.details.deviceType).toBeDefined();
    expect(res.body.details.message).toBeDefined();
  });

  it('POST then GET returns the created inquiry newest-first', async () => {
    await request(app).post('/api/inquiries').send({ ...valid, name: 'First' });
    await request(app).post('/api/inquiries').send({ ...valid, name: 'Second' });

    const res = await request(app).get('/api/inquiries');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.items[0].name).toBe('Second');
    expect(res.body.items[1].name).toBe('First');
  });

  it('GET /api/inquiries supports limit query', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/inquiries').send({ ...valid, name: `N${i}` });
    }
    const res = await request(app).get('/api/inquiries?limit=2');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
  });

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFound');
  });

  it('stores null email when omitted', async () => {
    const { email, ...noEmail } = valid;
    void email;
    const res = await request(app).post('/api/inquiries').send(noEmail);
    expect(res.status).toBe(201);
    expect(res.body.email).toBeNull();
  });
});
