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

describe('DELETE /tenants/:id', () => {

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
                .delete(`/tenants/${id}`)
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
                .delete(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should return the deleted tenant id', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            const response = await request(app)
                .delete(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.body).toHaveProperty('id', id);
        });

        it('should delete the tenant from db', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            // Act
            await request(app)
                .delete(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            const deletedTenant = await tenantRepository.findById(id);
            expect(deletedTenant).toBeNull();
        });

        it('should return 404 on subsequent GET after deletion', async () => {
            // Arrange
            const createResponse = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'tenant name', address: 'tenant address' });
            const { id } = createResponse.body;

            await request(app)
                .delete(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Act
            const response = await request(app)
                .get(`/tenants/${id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.statusCode).toBe(404);
        });

        it('should not delete other tenants', async () => {
            // Arrange
            const createResponse1 = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'Tenant 1', address: 'Address 1' });

            const createResponse2 = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send({ name: 'Tenant 2', address: 'Address 2' });

            // Act
            await request(app)
                .delete(`/tenants/${createResponse1.body.id}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            const remainingTenant = await tenantRepository.findById(createResponse2.body.id);
            expect(remainingTenant).not.toBeNull();
            expect(remainingTenant?.name).toBe('Tenant 2');
        });

    });

    describe('Authentication', () => {

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';

            // Act
            const response = await request(app).delete(`/tenants/${nonExistentId}`);

            // Assert
            expect(response.statusCode).toBe(401);
        });

        it('should return 403 if user is not admin', async () => {
            // Arrange
            const nonExistentId = '000000000000000000000001';
            const customerToken = jwks.token({ sub: 'test-user-id', role: UserRole.CUSTOMER });

            // Act
            const response = await request(app)
                .delete(`/tenants/${nonExistentId}`)
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
                .delete(`/tenants/${invalidId}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

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
                .delete(`/tenants/${nonExistentId}`)
                .set('Cookie', [`accessToken=${getAccessToken()}`]);

            // Assert
            expect(response.statusCode).toBe(404);
        });

    });

});
