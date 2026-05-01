import request from 'supertest';
import app from '@/app';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { RepositoryFactory } from '@/factories/repository.factory';
import { UserRole } from '@/types/user';
import { HashingService } from '@/utils/hashing';

const userRepository = RepositoryFactory.createUserRepository();
const testDatabaseStrategy = TestDatabaseFactory.createStrategy();
const db = new TestDatabase(testDatabaseStrategy);

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
        password: 'secret@123'
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
        password: 'secret@123'
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
        password: 'secret@123'
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

    it('should store hashed password in database', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.user.id);
      expect(savedUser?.password).not.toBe(user.password);
      expect(await HashingService.compare(user.password, savedUser?.password as string)).toBe(true);
    });

    it('should not return password in response', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should assign a cutomer role to it', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      //Act
      const response = await request(app).post('/auth/register').send(user);

      //Assert
      expect(response.body.user).toHaveProperty('role');
      expect(response.body.user.role).toBe(UserRole.CUSTOMER);
    });

    it('should return 400 status code if email is already registered', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }
      
      // Act
      await request(app).post('/auth/register').send(user);
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: '',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return an array of error messages if email is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: '',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Email is required');
    });

    it('should return an array of error messages if firstName is missing', async () => {

      // Arrange
      const user = {
        firstName: '',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('First name is required');
    });

    it('should return an array of error messages if lastName is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: '',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Last name is required');
    });

    it('should return an array of error messages if password is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: ''
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters');
    });

    it('should return 400 status code if firstName is missing', async () => {

      // Arrange
      const user = {
        firstName: '',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 status code if lastName is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: '',
        email: 'raj@gmail.com',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 status code if password is missing', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: ''
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should trim email field', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: ' raj@gmail.com ',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(201);
      const savedUser = await userRepository.findById(response.body.user.id);
      expect(savedUser?.email).toBe(user.email.trim());
    });

    it('should return 400 status code if email is not a valid email', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'not-an-email',
        password: 'secret@123'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 status code if password length is less than 8 characters', async () => {

      // Arrange
      const user = {
        firstName: 'Raj',
        lastName: 'Singh',
        email: 'raj@gmail.com',
        password: 'short'
      }

      // Act
      const response = await request(app).post('/auth/register').send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

  });
});
