import request from 'supertest';
import app from '@/app';
import { TestDatabase } from "../helpers/test-database/test-database";
import { TestDatabaseFactory } from "../helpers/test-database/test-database.factory";
import createJwksMock from 'mock-jwks';

const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);
const jwks = createJwksMock('http://localhost:3001');

beforeAll(async () => {
    jwks.start();
    await db.setup();
});
afterEach(async () => await db.cleanup());
afterAll(async () => {
    jwks.stop();
    await db.teardown();
});

describe('GET /auth/self', () => {

    describe('Given all fields', () => {

        it('should return 200 status code', async () => {
            // Arrange
            const user = {
                firstName: 'Raj',
                lastName: 'Singh',
                email: 'raj@gmail.com',
                password: 'secret@123'
            }
            const registerResponse = await request(app).post('/auth/register').send(user);

            const accessToken = jwks.token({ sub: registerResponse.body.user.id, role: registerResponse.body.user.role });

            // Act
            const response = await request(app).get('/auth/self').set('Cookie', [`accessToken=${accessToken}`]);

            // Assert
            expect(response.statusCode).toBe(200);
        });

        it('should return valid json in response', async () => {
            // Arrange
            const user = {
                firstName: 'Raj',
                lastName: 'Singh',
                email: 'raj@gmail.com',
                password: 'secret@123'
            }
            const registerResponse = await request(app).post('/auth/register').send(user);

            const accessToken = jwks.token({ sub: registerResponse.body.user.id, role: registerResponse.body.user.role });

            // Act
            const response = await request(app).get('/auth/self').set('Cookie', [`accessToken=${accessToken}`]);

            // Assert
            expect(response.headers['content-type']).toMatch(/json/);
        });
        
        it('should return user data in response', async () => {
            // Arrange
            const user = {
                firstName: 'Raj',
                lastName: 'Singh',
                email: 'raj@gmail.com',
                password: 'secret@123'
            }
            const registerResponse = await request(app).post('/auth/register').send(user);
            
            const accessToken = jwks.token({ sub: registerResponse.body.user.id, role: registerResponse.body.user.role });

            // Act
            const response = await request(app).get('/auth/self').set('Cookie', [`accessToken=${accessToken}`]).send();

            // Assert
            expect(response.body.user.id).toBe(registerResponse.body.user.id);
        })

        it('should not return user password in response', async () => {
            // Arrange
            const user = {
                firstName: 'Raj',
                lastName: 'Singh',
                email: 'raj@gmail.com',
                password: 'secret@123'
            }
            const registerResponse = await request(app).post('/auth/register').send(user);
            
            const accessToken = jwks.token({ sub: registerResponse.body.user.id, role: registerResponse.body.user.role });

            // Act
            const response = await request(app).get('/auth/self').set('Cookie', [`accessToken=${accessToken}`]).send();

            // Assert
            expect(response.body.user.id).toBe(registerResponse.body.user.id);
            expect(response.body.user).not.toHaveProperty('password');
        })

    })
})