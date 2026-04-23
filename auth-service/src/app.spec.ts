import request from 'supertest';
import app from './app';

describe('App', () => {
  it('should return welcome message on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('welcome to auth service');
  });
});
