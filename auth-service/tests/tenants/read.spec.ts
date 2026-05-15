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

describe('GET /tenants', () => {

    describe('Given valid request', () => {

        it('should return 200 status code', async () => {
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            expect(response.statusCode).toBe(200);
        });

        it('should return valid json response', async () => {
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

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
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
        });

        it('should return tenants with correct fields', async () => {
            // Arrange
            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'Tenant 1', address: 'Address 1' });

            // Act
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            const tenant = response.body[0];
            expect(tenant).toHaveProperty('id');
            expect(tenant).toHaveProperty('name', 'Tenant 1');
            expect(tenant).toHaveProperty('address', 'Address 1');
        });

        it('should return an empty array when no tenants exist', async () => {
            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });

    });

    describe('Authentication', () => {

        it('should return 401 if user is not authenticated', async () => {
            const response = await request(app).get('/tenants');
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            const customerToken = jwks.token({ sub: 'test-user-id', role: UserRole.CUSTOMER });

            const response = await request(app)
                .get('/tenants')
                .set('Cookie', [`accessToken=${customerToken}`]);

            expect(response.statusCode).toBe(403);
        });

    });

});
