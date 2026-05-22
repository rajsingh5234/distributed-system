import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { UserRole } from '@/types/user';

const jwks = createJwksMock('http://localhost:3000');
const userRepository = RepositoryFactory.createUserRepository();

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

const createUser = (overrides = {}) =>
  request(app)
    .post('/users')
    .set('Cookie', [`accessToken=${getAccessToken()}`])
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      ...overrides,
    });

describe('PATCH /users/:id', () => {
  describe('Given valid request', () => {
    it('should return 200 status code', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane', lastName: 'Smith' });

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it('should return valid json response', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane', lastName: 'Smith' });

      // Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return the updated user', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane', lastName: 'Smith' });

      // Assert
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Smith');
    });

    it('should not return password in response', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane' });

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });

    it('should update only firstName if only firstName is provided', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane' });

      // Assert
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Doe');
    });

    it('should update only lastName if only lastName is provided', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ lastName: 'Smith' });

      // Assert
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Smith');
    });

    it('should update role if role is provided', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ role: UserRole.MANAGER });

      // Assert
      expect(response.body).toHaveProperty('role', UserRole.MANAGER);
    });

    it('should persist updated values in db', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane', lastName: 'Smith' });

      // Assert
      const savedUser = await userRepository.findById(id);
      expect(savedUser?.firstName).toBe('Jane');
      expect(savedUser?.lastName).toBe('Smith');
    });
  });

  describe('Invalid params', () => {
    it('should return 400 if id is not a valid ObjectId', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const response = await request(app)
        .patch(`/users/${invalidId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane' });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Invalid user id');
    });
  });

  describe('Not found', () => {
    it('should return 404 if user does not exist', async () => {
      // Arrange
      const nonExistentId = '000000000000000000000001';

      // Act
      const response = await request(app)
        .patch(`/users/${nonExistentId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'Jane' });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('Fields validation', () => {
    it('should return 400 if firstName is empty string', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: '' });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('First name is required');
    });

    it('should return 400 if lastName is empty string', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ lastName: '' });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('Last name is required');
    });

    it('should return 400 if role is admin', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ role: UserRole.ADMIN });

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should trim firstName before saving', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: '  Jane  ' });

      // Assert
      const savedUser = await userRepository.findById(id);
      expect(savedUser?.firstName).toBe('Jane');
    });

    it('should trim lastName before saving', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      await request(app)
        .patch(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ lastName: '  Smith  ' });

      // Assert
      const savedUser = await userRepository.findById(id);
      expect(savedUser?.lastName).toBe('Smith');
    });
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const nonExistentId = '000000000000000000000001';

      // Act
      const response = await request(app)
        .patch(`/users/${nonExistentId}`)
        .send({ firstName: 'Jane' });

      // Assert
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
        .patch(`/users/${nonExistentId}`)
        .set('Cookie', [`accessToken=${customerToken}`])
        .send({ firstName: 'Jane' });

      // Assert
      expect(response.statusCode).toBe(403);
    });
  });
});
