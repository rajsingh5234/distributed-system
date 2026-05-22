import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { ServiceFactory } from '@/factories/service.factory';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';

const jwks = createJwksMock('http://localhost:3000');
const tokenService = ServiceFactory.createTokenService();
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

const user = {
  firstName: 'Raj',
  lastName: 'Singh',
  email: 'raj@gmail.com',
  password: 'secret@123',
};

describe('POST /auth/logout', () => {
  describe('Given a valid access token', () => {
    it('should return 200 status code', async () => {
      // Arrange
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
      const { id, role } = registerResponse.body.user;
      const accessToken = jwks.token({ sub: id, role });
      const refreshTokenCookie = (
        registerResponse.headers['set-cookie'] as unknown as string[]
      ).find((c: string) => c.startsWith('refreshToken='));

      // Act
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`, refreshTokenCookie!]);

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it('should clear access token cookie', async () => {
      // Arrange
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
      const { id, role } = registerResponse.body.user;
      const accessToken = jwks.token({ sub: id, role });
      const refreshTokenCookie = (
        registerResponse.headers['set-cookie'] as unknown as string[]
      ).find((c: string) => c.startsWith('refreshToken='));

      // Act
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`, refreshTokenCookie!]);

      // Assert
      const responseCookies = response.headers[
        'set-cookie'
      ] as unknown as string[];
      const accessTokenCookie = responseCookies.find((c: string) =>
        c.startsWith('accessToken=')
      );
      expect(accessTokenCookie).toMatch(/accessToken=;/);
    });

    it('should clear refresh token cookie', async () => {
      // Arrange
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
      const { id, role } = registerResponse.body.user;
      const accessToken = jwks.token({ sub: id, role });
      const refreshTokenCookie = (
        registerResponse.headers['set-cookie'] as unknown as string[]
      ).find((c: string) => c.startsWith('refreshToken='));

      // Act
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`, refreshTokenCookie!]);

      // Assert
      const responseCookies = response.headers[
        'set-cookie'
      ] as unknown as string[];
      const clearedRefreshTokenCookie = responseCookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      expect(clearedRefreshTokenCookie).toMatch(/refreshToken=;/);
    });

    it('should delete refresh token from db', async () => {
      // Arrange
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
      const { id, role } = registerResponse.body.user;
      const accessToken = jwks.token({ sub: id, role });
      const cookies = registerResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const refreshTokenCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];
      const { jwtid } = tokenService.verifyRefreshToken(refreshToken!);

      // Act
      await request(app)
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`, refreshTokenCookie!]);

      // Assert
      const tokenInDb = await refreshTokenRepository.findById(jwtid);
      expect(tokenInDb).toBeNull();
    });
  });

  describe('Given no access token', () => {
    it('should return 401 status code', async () => {
      // Arrange
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
      const cookies = registerResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const refreshTokenCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );

      // Act — send only refresh token, no access token
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', [refreshTokenCookie!]);

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
