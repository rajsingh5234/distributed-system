import request from 'supertest';
import app from '@/app';
import createJwksMock from 'mock-jwks';
import { RepositoryFactory } from '@/factories/repository.factory';
import { TestDatabase } from '../helpers/test-database/test-database';
import { TestDatabaseFactory } from '../helpers/test-database/test-database.factory';
import { UserRole } from '@/types/user';

const jwks = createJwksMock('http://localhost:3000');
const userRepository = RepositoryFactory.createUserRepository();

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

const getAccessToken = () =>
  jwks.token({ sub: 'test-user-id', role: UserRole.ADMIN });

describe('POST /users', () => {
  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it('should return valid json response', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return created user in response', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(user.firstName);
      expect(response.body.lastName).toBe(user.lastName);
      expect(response.body.email).toBe(user.email);
    });

    it('should not return password in response', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body).not.toHaveProperty('password');
    });

    it('should create user with MANAGER role', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.MANAGER,
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.role).toBe(UserRole.MANAGER);
    });

    it('should create user with CUSTOMER role', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.role).toBe(UserRole.CUSTOMER);
    });

    it('should persist user in db', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser).not.toBeNull();
      expect(savedUser?.email).toBe(user.email);
    });

    it('should create user with tenant when tenant is provided', async () => {
      // Arrange
      const tenantResponse = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ name: 'Test Tenant', address: 'Test Address' });
      const { id: tenantId } = tenantResponse.body;

      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        tenant: tenantId,
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser?.tenant?.toString()).toBe(tenantId);
    });

    it('should store hashed password in db', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser?.password).not.toBe(user.password);
    });
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app).post('/users').send(user);

      // Assert
      expect(response.statusCode).toBe(401);
      const savedUser = await userRepository.findByEmail(user.email);
      expect(savedUser).toBeNull();
    });

    it('should return 403 if user is not admin', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const customerToken = jwks.token({
        sub: 'test-user-id',
        role: UserRole.CUSTOMER,
      });

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${customerToken}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(403);
      const savedUser = await userRepository.findByEmail(user.email);
      expect(savedUser).toBeNull();
    });
  });

  describe('Duplicate email', () => {
    it('should return 400 if email already exists', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should not create duplicate user in db', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Act
      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send({ ...user, firstName: 'Jane' });

      // Assert
      const savedUser = await userRepository.findByEmail(user.email);
      expect(savedUser?.firstName).toBe('John');
    });
  });

  describe('Fields are missing', () => {
    it('should return 400 if firstName is missing', async () => {
      // Arrange
      const user = {
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return error message if firstName is missing', async () => {
      // Arrange
      const user = {
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('First name is required');
    });

    it('should return 400 if lastName is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return error message if lastName is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Last name is required');
    });

    it('should return 400 if email is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return error message if email is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Email is required');
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return error message if password is missing', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors[0].msg).toBe('Password is required');
    });
  });

  describe('Fields are not in proper format', () => {
    it('should return 400 if firstName is empty string', async () => {
      // Arrange
      const user = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('First name is required');
    });

    it('should return 400 if lastName is empty string', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('Last name is required');
    });

    it('should return 400 if email is not valid format', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('Invalid email format');
    });

    it('should return 400 if tenant is not a valid ObjectId', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        tenant: 'invalid-id',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe('Invalid tenant id');
    });

    it('should return 400 if role is admin', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 if password is less than 8 characters', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'short',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors[0].msg).toBe(
        'Password must be at least 8 characters'
      );
    });

    it('should trim firstName before saving', async () => {
      // Arrange
      const user = {
        firstName: '  John  ',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser?.firstName).toBe('John');
    });

    it('should trim lastName before saving', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: '  Doe  ',
        email: 'john@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser?.lastName).toBe('Doe');
    });

    it('should lowercase email before saving', async () => {
      // Arrange
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      };

      // Act
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${getAccessToken()}`])
        .send(user);

      // Assert
      const savedUser = await userRepository.findById(response.body.id);
      expect(savedUser?.email).toBe('john@example.com');
    });
  });
});
