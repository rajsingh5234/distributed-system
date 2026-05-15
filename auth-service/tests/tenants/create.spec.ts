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

describe('POST /tenants', () => {

    describe('Given all fields', () => {

        it('should return 201 status code', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });

        it('should return created tenant in response', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(tenant.name);
            expect(response.body.address).toBe(tenant.address);
        });

        it('should persist tenant in db', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            const { id } = response.body;
            const savedTenant = await tenantRepository.findById(id);
            expect(savedTenant).not.toBeNull();
            expect(savedTenant?.name).toBe(tenant.name);
            expect(savedTenant?.address).toBe(tenant.address);
        });

    });

    describe('Authentication', () => {

        it('should return 401 status code if user is not authenticated', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: 'tenant address' };

            // Act
            const response = await request(app).post('/tenants').send(tenant);

            // Assert
            expect(response.statusCode).toBe(401);
            const tenants = await tenantRepository.getAll();
            expect(tenants).toHaveLength(0);
        });

    });

    describe('Fields are missing', () => {

        it('should return 400 status code if name is missing', async () => {
            // Arrange
            const tenant = { address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return an array of error messages if name is missing', async () => {
            // Arrange
            const tenant = { address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Name is required');
        });

        it('should return 400 status code if address is missing', async () => {
            // Arrange
            const tenant = { name: 'tenant name' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.statusCode).toBe(400);
        });

        it('should return an array of error messages if address is missing', async () => {
            // Arrange
            const tenant = { name: 'tenant name' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.body.errors).toBeInstanceOf(Array);
            expect(response.body.errors[0].msg).toBe('Address is required');
        });

    });

    describe('Fields are not in proper format', () => {

        it('should return 400 if name is empty string', async () => {
            // Arrange
            const tenant = { name: '', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors[0].msg).toBe('Name is required');
        });

        it('should return 400 if address is empty string', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: '' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            expect(response.statusCode).toBe(400);
            expect(response.body.errors[0].msg).toBe('Address is required');
        });

        it('should trim name before saving', async () => {
            // Arrange
            const tenant = { name: '  tenant name  ', address: 'tenant address' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            const savedTenant = await tenantRepository.findById(response.body.id);
            expect(savedTenant?.name).toBe('tenant name');
        });

        it('should trim address before saving', async () => {
            // Arrange
            const tenant = { name: 'tenant name', address: '  tenant address  ' };

            // Act
            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${getAccessToken()}`])
                .send(tenant);

            // Assert
            const savedTenant = await tenantRepository.findById(response.body.id);
            expect(savedTenant?.address).toBe('tenant address');
        });

    });

});
