import request from 'supertest';
import app from '@/app';
import { TestDatabase } from "../helpers/test-database/test-database";
import { TestDatabaseFactory } from "../helpers/test-database/test-database.factory";
import { ServiceFactory } from '@/factories/service.factory';
import { RepositoryFactory } from '@/factories/repository.factory';

const refreshTokenRepository = RepositoryFactory.createRefreshTokenRepository();
const tokenService = ServiceFactory.createTokenService();
const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);

beforeAll(async () => await db.setup());
afterEach(async () => await db.cleanup());
afterAll(async () => await db.teardown());

describe('POST /auth/login', () => {

    describe('Given all fields', () => {

        it('should return 200 status code', async () => {
            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);
          
            const credentials = { email: user.email, password: user.password }
          
            // Act
            const response = await request(app).post('/auth/login').send(credentials);
          
            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return json response', async () => {

            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: user.password }
      
            //Act
            const response = await request(app).post('/auth/login').send(credentials);
      
            //Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should login and return logged in user in response', async () => {

            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: user.password }
      
            //Act
            const response = await request(app).post('/auth/login').send(credentials);
      
            //Assert
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(user.email);
        });

        it('should not return password in response', async () => {

            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: user.password }
      
            // Act
            const response = await request(app).post('/auth/login').send(credentials);
      
            // Assert
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should set access token and refresh token in cookies', async () => {
            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: user.password }
            
            // Act
            const response = await request(app).post('/auth/login').send(credentials);
      
            // Assert
            const cookies = response.headers['set-cookie'] as unknown as string[];
      
            const accessTokenCookie = cookies.find((cookie: string) => cookie.startsWith('accessToken='));
            const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith('refreshToken='));
      
            let accessToken;
            if (accessTokenCookie) {
              accessToken = accessTokenCookie.split(';')[0].split('=')[1];
            }
      
            let refreshToken;
            if (refreshTokenCookie) {
              refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
            }
      
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(tokenService.verifyAccessToken(accessToken!)).toBeTruthy();
            expect(tokenService.verifyRefreshToken(refreshToken!)).toBeTruthy();
        });

        it('should store refresh token in database', async () => {
            // Arrange
            const user = {
              firstName: 'Raj',
              lastName: 'Singh',
              email: 'raj@gmail.com',
              password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: user.password }
      
            // Act
            const response = await request(app).post('/auth/login').send(credentials);
      
            // Assert
            const cookies = response.headers['set-cookie'] as unknown as string[];
            const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith('refreshToken='));
            const refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1];
      
            const { jwtid } = tokenService.verifyRefreshToken(refreshToken!);
            const savedRefreshToken = await refreshTokenRepository.findById(jwtid);
      
            expect(savedRefreshToken).not.toBeNull();
            expect(savedRefreshToken?.userId).toBe(response.body.user.id);
            expect(savedRefreshToken?.expiresAt).toBeInstanceOf(Date);
            expect(savedRefreshToken?.expiresAt.getTime()).toBeGreaterThan(Date.now());
        });

    })

    describe('Fields are missing', () => {

        it('should return 400 status code if email field is missing', async () => {

            // Arrange
            const credentials = { email: '', password: 'secret@123' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return an array of error messages if email is missing', async () => {

            // Arrange
            const credentials = { email: '', password: 'secret@123' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Email is required');
        });

        it('should return 400 status code if password is missing', async () => {

            // Arrange
            const credentials = { email: 'raj@gmail.com', password: '' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return an array of error messages if password is missing', async () => {

            // Arrange
            const credentials = { email: 'raj@gmail.com', password: '' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters');
        });
    })

    describe('Fields are not in proper format', () => {

        it('should return 400 status code if email is not a valid email', async () => {

            // Arrange
            const credentials = { email: 'not-an-email', password: 'secret@123' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return 400 status code if password length is less than 8 characters', async () => {

            // Arrange
            const credentials = { email: 'raj@gmail.com', password: 'short' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(400);
        });
    })

    describe('Invalid credentials', () => {

        it('should return 401 status code if email is not registered', async () => {

            // Arrange
            const credentials = { email: 'unknown@gmail.com', password: 'secret@123' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 401 status code if password is wrong', async () => {

            // Arrange
            const user = {
                firstName: 'Raj',
                lastName: 'Singh',
                email: 'raj@gmail.com',
                password: 'secret@123'
            }
            await request(app).post('/auth/register').send(user);

            const credentials = { email: user.email, password: 'wrongpassword' }

            // Act
            const response = await request(app).post('/auth/login').send(credentials);

            // Assert
            expect(response.statusCode).toBe(401);
        });
    })
})