import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { UserRole } from '@/types/user';

const jwks = createJwksMock('http://localhost:3000');

const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);

beforeAll(async () => {
  jwks.start();
  await db.setup();
});
afterEach(async () => await db.cleanup());
afterAll(async () => {
  jwks.stop();
  await db.teardown();
});

const getAccessToken = () =>
  jwks.token({ sub: 'test-user-id', role: UserRole.ADMIN });

describe('GET /tenants', () => {
  describe('Given valid request', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/tenants');

      expect(response.statusCode).toBe(200);
    });

    it('should return valid json response', async () => {
      const response = await request(app).get('/tenants');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return a list of tenants', async () => {
      // Arrange — create two tenants
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'Tenant 1', address: 'Address 1' });

      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'Tenant 2', address: 'Address 2' });

      // Act
      const response = await request(app).get('/tenants');

      // Assert
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return tenants with correct fields', async () => {
      // Arrange
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'Tenant 1', address: 'Address 1' });

      // Act
      const response = await request(app).get('/tenants');

      // Assert
      const tenant = response.body.data[0];
      expect(tenant).toHaveProperty('id');
      expect(tenant).toHaveProperty('name', 'Tenant 1');
      expect(tenant).toHaveProperty('address', 'Address 1');
    });

    it('should return an empty array when no tenants exist', async () => {
      const response = await request(app).get('/tenants');

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return pagination metadata', async () => {
      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'Tenant 1', address: 'Address 1' });

      const response = await request(app).get('/tenants?currentPage=1&perPage=6');

      expect(response.body).toHaveProperty('total', 1);
      expect(response.body).toHaveProperty('currentPage', 1);
      expect(response.body).toHaveProperty('perPage', 6);
    });

    it('should be accessible without authentication', async () => {
      const response = await request(app).get('/tenants');

      expect(response.statusCode).toBe(200);
    });
  });
});

describe('GET /tenants/:id', () => {
  describe('Given valid request', () => {
    it('should return 200 status code', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'tenant name', address: 'tenant address' });
      const { id } = createResponse.body;

      // Act
      const response = await request(app)
        .get(`/tenants/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it('should return valid json response', async () => {
      // Arrange
      const createResponse = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'tenant name', address: 'tenant address' });
      const { id } = createResponse.body;

      // Act
      const response = await request(app)
        .get(`/tenants/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return the correct tenant with all fields', async () => {
      // Arrange
      const tenant = { name: 'tenant name', address: 'tenant address' };
      const createResponse = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(tenant);
      const { id } = createResponse.body;

      // Act
      const response = await request(app)
        .get(`/tenants/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('name', tenant.name);
      expect(response.body).toHaveProperty('address', tenant.address);
    });
  });

  describe('Not found', () => {
    it('should return 404 if tenant does not exist', async () => {
      // Arrange
      const nonExistentId = '000000000000000000000001';

      // Act
      const response = await request(app)
        .get(`/tenants/${nonExistentId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Invalid params', () => {
    it('should return 400 if id is not a valid ObjectId', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const response = await request(app)
        .get(`/tenants/${invalidId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Invalid tenant id');
    });
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      const nonExistentId = '000000000000000000000001';
      const response = await request(app).get(`/tenants/${nonExistentId}`);
      expect(response.statusCode).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      // Arrange
      const nonExistentId = '000000000000000000000001';
      const customerToken = jwks.token({
        sub: 'test-user-id',
        role: UserRole.CUSTOMER,
      });

      // Act
      const response = await request(app)
        .get(`/tenants/${nonExistentId}`)
        .set('Cookie', [`accessToken=${customerToken}`]);

      // Assert
      expect(response.statusCode).toBe(403);
    });
  });
});
