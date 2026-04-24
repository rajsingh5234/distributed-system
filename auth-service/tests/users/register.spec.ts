import request from 'supertest';
import app from '../../src/app';

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
  });

  describe('Fields are missing', () => {
    
  });
});
