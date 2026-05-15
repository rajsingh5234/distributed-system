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

const getAccessToken = () => jwks.token({ sub: 'test-user-id', role: UserRole.ADMIN });

const createUser = (overrides = {}) =>
    request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password123', ...overrides });

describe('GET /users', () => {

    describe('Given valid request', () => {

        it('should return 200 status code', async () => {
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should return a list of users', async () => {
            // Arrange
            await createUser({ email: 'user1@example.com' });
            await createUser({ email: 'user2@example.com' });

            // Act
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
        });

        it('should return users with correct fields', async () => {
            // Arrange
            await createUser();

            // Act
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            const user = response.body[0];
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('firstName', 'John');
            expect(user).toHaveProperty('lastName', 'Doe');
            expect(user).toHaveProperty('email', 'john@example.com');
            expect(user).toHaveProperty('role');
        });

        it('should not return password in the list', async () => {
            // Arrange
            await createUser();

            // Act
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.body[0]).not.toHaveProperty('password');
        });

        it('should return an empty array when no users exist', async () => {
            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });

    });

    describe('Authentication', () => {

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).get('/users');
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            const customerToken = jwks.token({ sub: 'test-user-id', role: UserRole.CUSTOMER });

            const response = await request(app)
                .get('/users')
                .set('Cookie', [`accessToken=${customerToken}`]);

            expect(response.statusCode).toBe(403);
        });

    });

});

describe('GET /users/:id', () => {

    describe('Given valid request', () => {

        it('should return 200 status code', async () => {
            // Arrange
            const createResponse = await createUser();
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .get(`/users/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            // Arrange
            const createResponse = await createUser();
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .get(`/users/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should return the correct user with all fields', async () => {
            // Arrange
            const createResponse = await createUser();
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .get(`/users/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.body).toHaveProperty('id', id);
            expect(response.body).toHaveProperty('firstName', 'John');
            expect(response.body).toHaveProperty('lastName', 'Doe');
            expect(response.body).toHaveProperty('email', 'john@example.com');
            expect(response.body).toHaveProperty('role');
        });

        it('should not return password in response', async () => {
            // Arrange
            const createResponse = await createUser();
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .get(`/users/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.body).not.toHaveProperty('password');
        });

    });

    describe('Not found', () => {

        it('should return 404 if user does not exist', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';

            // Act
            const response = await request(app)
                .get(`/users/${nonExistentId}`)
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
                .get(`/users/${invalidId}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Invalid user id');
        });

    });

    describe('Authentication', () => {

        it('should return 401 if user is not authenticated', async () => {
            const nonExistentId = '000000000000000000000001';
            const response = await request(app).get(`/users/${nonExistentId}`);
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';
            const customerToken = jwks.token({ sub: 'test-user-id', role: UserRole.CUSTOMER });

            // Act
            const response = await request(app)
                .get(`/users/${nonExistentId}`)
                .set('Cookie', [`accessToken=${customerToken}`]);

            // Assert
            expect(response.statusCode).toBe(403);
        });

    });

});
