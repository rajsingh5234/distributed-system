import request from 'supertest';
import app from '../../src/app';
import { TestDatabase } from '../helpers/test-database/test-database';
import { MongoStrategy } from '../helpers/test-database/strategies/mongo.strategy';
import { RepositoryFactory } from '../../src/factories/repository.factory';

const userRepository = RepositoryFactory.createUserRepository();
const db = new TestDatabase(new MongoStrategy());

beforeAll(async () => await db.setup());
afterEach(async () => await db.cleanup());
afterAll(async () => await db.teardown());

describe('POST /auth/register', () => {
  describe('Given all fields', () => {
    it('should return 201 status code', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret'
      }

      //Act
      const response = await request(app).post('/auth/register').send(user);

      //Assert
      expect(response.statusCode).toBe(201);
    });

    it('should return json response', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret'
      }

      //Act
      const response = await request(app).post('/auth/register').send(user);

      //Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should persist the user in database', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret'
      }

      //Act
      const response = await request(app).post('/auth/register').send(user);

      //Assert
      expect(response.body.user).toHaveProperty('id');
      const savedUser = await userRepository.findById(response.body.user.id);
      expect(savedUser).not.toBeNull();
      expect(savedUser).toHaveProperty('firstName');
      expect(savedUser).toHaveProperty('lastName');
      expect(savedUser).toHaveProperty('email');
      expect(savedUser?.firstName).toBe(user.firstName);
      expect(savedUser?.lastName).toBe(user.lastName);
      expect(savedUser?.email).toBe(user.email);
    });
  });

  describe('Fields are missing', () => {
    it.skip('should return 400 status code', async () => {

      // Arrange
      const user = {}

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
});
