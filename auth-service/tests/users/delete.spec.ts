import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { UserRole } from '@/types/user';

const jwks = createJwksMock('http://localhost:3000');
const userRepository = RepositoryFactory.createUserRepository();
const refreshTokenRepository = RepositoryFactory.createRefreshTokenRepository();

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

describe('DELETE /users/:id', () => {
  describe('Given valid request', () => {
    it('should return 200 status code', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

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
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return the deleted user id', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      const response = await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.body).toHaveProperty('id', id);
    });

    it('should delete the user from db', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      // Act
      await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      const deletedUser = await userRepository.findById(id);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 on subsequent GET after deletion', async () => {
      // Arrange
      const {
        body: { id },
      } = await createUser();

      await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Act
      const response = await request(app)
        .get(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.statusCode).toBe(404);
    });

    it('should delete all refresh tokens for the user', async () => {
      // Arrange — register via /auth/register so a refresh token is created
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        });
      const { id } = registerResponse.body.user;

      // extract jwtid from the refresh token cookie
      const cookies = registerResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const refreshTokenCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      const refreshToken = refreshTokenCookie!.split(';')[0].split('=')[1];
      const payload = JSON.parse(
        Buffer.from(refreshToken.split('.')[1], 'base64').toString()
      );

      // Act
      await request(app)
        .delete(`/users/${id}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      const deletedToken = await refreshTokenRepository.findById(payload.jwtid);
      expect(deletedToken).toBeNull();
    });

    it('should not delete other users', async () => {
      // Arrange
      const {
        body: { id: id1 },
      } = await createUser({ email: 'user1@example.com' });
      const {
        body: { id: id2 },
      } = await createUser({ email: 'user2@example.com' });

      // Act
      await request(app)
        .delete(`/users/${id1}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      const remainingUser = await userRepository.findById(id2);
      expect(remainingUser).not.toBeNull();
      expect(remainingUser?.email).toBe('user2@example.com');
    });
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const nonExistentId = '000000000000000000000001';

      // Act
      const response = await request(app).delete(`/users/${nonExistentId}`);

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
        .delete(`/users/${nonExistentId}`)
        .set('Cookie', [`accessToken=${customerToken}`]);

      // Assert
      expect(response.statusCode).toBe(403);
    });
  });

  describe('Invalid params', () => {
    it('should return 400 if id is not a valid ObjectId', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act
      const response = await request(app)
        .delete(`/users/${invalidId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

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
        .delete(`/users/${nonExistentId}`)
        .set('Cookie', [`accessToken=${getAccessToken()}`]);

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
