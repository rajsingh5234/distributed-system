import request from 'supertest';
import app from '@/app';
import { ServiceFactory } from '@/factories/service.factory';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';

const tokenService = ServiceFactory.createTokenService();
const refreshTokenRepository = RepositoryFactory.createRefreshTokenRepository();

const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);

beforeAll(async () => await db.setup());
afterEach(async () => await db.cleanup());
afterAll(async () => await db.teardown());

const user = {
    firstName: 'Raj',
    lastName: 'Singh',
    email: 'raj@gmail.com',
    password: 'secret@123'
};

describe('POST /auth/refresh', () => {

    describe('Given a valid refresh token', () => {

        it('should return 200 status code', async () => {
            // Arrange
            const registerResponse = await request(app).post('/auth/register').send(user);
            const cookies = registerResponse.headers['set-cookie'] as unknown as string[];

            // Act
            const response = await request(app).post('/auth/refresh').set('Cookie', cookies);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            // Arrange
            const registerResponse = await request(app).post('/auth/register').send(user);
            const cookies = registerResponse.headers['set-cookie'] as unknown as string[];

            // Act
            const response = await request(app).post('/auth/refresh').set('Cookie', cookies);

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should set new access token in cookie', async () => {
            // Arrange
            const registerResponse = await request(app).post('/auth/register').send(user);
            const cookies = registerResponse.headers['set-cookie'] as unknown as string[];

            // Act
            const response = await request(app).post('/auth/refresh').set('Cookie', cookies);

            // Assert
            const responseCookies = response.headers['set-cookie'] as unknown as string[];
            const accessTokenCookie = responseCookies.find((cookie: string) => cookie.startsWith('accessToken='));
            expect(accessTokenCookie).toBeDefined();
        });

        it('should set new refresh token in cookie', async () => {
            // Arrange
            const registerResponse = await request(app).post('/auth/register').send(user);
            const cookies = registerResponse.headers['set-cookie'] as unknown as string[];

            // Act
            const response = await request(app).post('/auth/refresh').set('Cookie', cookies);

            // Assert
            const responseCookies = response.headers['set-cookie'] as unknown as string[];
            const refreshTokenCookie = responseCookies.find((cookie: string) => cookie.startsWith('refreshToken='));
            expect(refreshTokenCookie).toBeDefined();
        });

        it('should rotate refresh token in db', async () => {
            // Arrange
            const registerResponse = await request(app).post('/auth/register').send(user);
            const registerCookies = registerResponse.headers['set-cookie'] as unknown as string[];
            const oldRefreshTokenCookie = registerCookies.find((c: string) => c.startsWith('refreshToken='));
            const oldRefreshToken = oldRefreshTokenCookie?.split(';')[0].split('=')[1];
            const oldPayload = tokenService.verifyRefreshToken(oldRefreshToken!);

            // Act
            const response = await request(app).post('/auth/refresh').set('Cookie', registerCookies);

            // Assert
            const responseCookies = response.headers['set-cookie'] as unknown as string[];
            const newRefreshTokenCookie = responseCookies.find((c: string) => c.startsWith('refreshToken='));
            const newRefreshToken = newRefreshTokenCookie?.split(';')[0].split('=')[1];
            const newPayload = tokenService.verifyRefreshToken(newRefreshToken!);

            const oldTokenInDb = await refreshTokenRepository.findById(oldPayload.jwtid);
            const newTokenInDb = await refreshTokenRepository.findById(newPayload.jwtid);

            expect(oldTokenInDb).toBeNull();
            expect(newTokenInDb).not.toBeNull();
        });

    });

    describe('Given no refresh token', () => {

        it('should return 401 status code', async () => {
            // Act
            const response = await request(app).post('/auth/refresh');

            // Assert
            expect(response.statusCode).toBe(401);
        });

    });

});
