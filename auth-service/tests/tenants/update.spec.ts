import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { UserRole } from '@/types/user';

const jwks = createJwksMock('http://localhost:3000');
const tenantRepository = RepositoryFactory.createTenantRepository();

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

describe('PATCH /tenants/:id', () => {

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
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name', address: 'updated address' });

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
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name', address: 'updated address' });

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should return the updated tenant', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name', address: 'updated address' });

            // Assert
            expect(response.body).toHaveProperty('id', id);
            expect(response.body).toHaveProperty('name', 'updated name');
            expect(response.body).toHaveProperty('address', 'updated address');
        });

        it('should update only name if only name is provided', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name' });

            // Assert
            expect(response.body).toHaveProperty('name', 'updated name');
            expect(response.body).toHaveProperty('address', 'tenant address');
        });

        it('should update only address if only address is provided', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ address: 'updated address' });

            // Assert
            expect(response.body).toHaveProperty('name', 'tenant name');
            expect(response.body).toHaveProperty('address', 'updated address');
        });

        it('should persist updated values in db', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name', address: 'updated address' });

            // Assert
            const savedTenant = await tenantRepository.findById(id);
            expect(savedTenant?.name).toBe('updated name');
            expect(savedTenant?.address).toBe('updated address');
        });

    });

    describe('Invalid params', () => {

        it('should return 400 if id is not a valid ObjectId', async () => {
            // Arrange
            const invalidId = 'invalid-id';

            // Act
            const response = await request(app)
                .patch(`/tenants/${invalidId}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name' });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Invalid tenant id');
        });

    });

    describe('Not found', () => {

        it('should return 404 if tenant does not exist', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';

            // Act
            const response = await request(app)
                .patch(`/tenants/${nonExistentId}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'updated name' });

            // Assert
            expect(response.statusCode).toBe(404);
        });

    });

    describe('Fields validation', () => {

        it('should return 400 if name is empty string', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: '' });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors[0].msg).toBe('Name is required');
        });

        it('should return 400 if address is empty string', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ address: '' });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors[0].msg).toBe('Address is required');
        });

        it('should trim name before saving', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: '  updated name  ' });

            // Assert
            const savedTenant = await tenantRepository.findById(id);
            expect(savedTenant?.name).toBe('updated name');
        });

        it('should trim address before saving', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            await request(app)
                .patch(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ address: '  updated address  ' });

            // Assert
            const savedTenant = await tenantRepository.findById(id);
            expect(savedTenant?.address).toBe('updated address');
        });

    });

    describe('Authentication', () => {

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';

            // Act
            const response = await request(app)
                .patch(`/tenants/${nonExistentId}`)
                .send({ name: 'updated name' });

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';
            const customerToken = jwks.token({ sub: 'test-user-id', role: UserRole.CUSTOMER });

            // Act
            const response = await request(app)
                .patch(`/tenants/${nonExistentId}`)
                .set('Cookie', [`accessToken=${customerToken}`])
                .send({ name: 'updated name' });

            // Assert
            expect(response.statusCode).toBe(403);
        });

    });

});
