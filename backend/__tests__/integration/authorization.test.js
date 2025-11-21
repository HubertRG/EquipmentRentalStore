const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../../src/models/User');
const authRoutes = require('../../src/controllers/authController');

process.env.JWTPRIVATEKEY = 'test-secret-key';
process.env.SALT = '10';
process.env.ADMIN_CREATION_KEY = 'test-admin-key';

const app = express();
app.use(express.json());
app.use('/authorization', authRoutes);

describe('Auth Routes - Integration Tests', () => {
  describe('POST /authorization/signup', () => {
    test('Should create a new user with valid data', async () => {
      const userData = {
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created succesfully');

      // Check if user was added to the database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.fullName).toBe(userData.fullName);
      expect(user.userName).toBe(userData.userName);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('user');

      // Check if password was hashed
      expect(user.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.password
      );
      expect(isPasswordValid).toBe(true);
    });

    test('Should return 400 error when required fields are missing', async () => {
      const incompleteData = {
        fullName: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .send(incompleteData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('Should return 409 error when email already exists', async () => {
      const userData = {
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'existing@example.com',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      // First user - should succeed
      await request(app).post('/authorization/signup').send(userData).expect(201);

      // Second user with the same email - should return error
      const duplicateUser = {
        ...userData,
        userName: 'otheruser',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.message).toBe(
        'User with given email already exists!'
      );
    });

    test('Should return 409 error when userName already exists', async () => {
      const userData = {
        fullName: 'John Doe',
        userName: 'uniqueusername',
        email: 'user1@example.com',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      await request(app).post('/authorization/signup').send(userData).expect(201);

      const duplicateUser = {
        ...userData,
        email: 'different@example.com',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.message).toBe(
        'User with given username already exists!'
      );
    });

    test('Should create an admin with a valid key', async () => {
      const adminData = {
        fullName: 'Admin User',
        userName: 'adminuser',
        email: 'admin@example.com',
        phonenumber: '987654321',
        password: 'AdminPass123!',
        role: 'admin',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .set('x-admin-key', process.env.ADMIN_CREATION_KEY)
        .send(adminData)
        .expect(201);

      const user = await User.findOne({ email: adminData.email });
      expect(user.role).toBe('admin');
    });

    test('Should return 403 error when creating admin without a key', async () => {
      const adminData = {
        fullName: 'Admin User',
        userName: 'adminuser2',
        email: 'admin2@example.com',
        phonenumber: '987654321',
        password: 'AdminPass123!',
        role: 'admin',
      };

      const response = await request(app)
        .post('/authorization/signup')
        .send(adminData)
        .expect(403);

      expect(response.body.message).toBe(
        'Nieprawidłowy klucz tworzenia administratora'
      );
    });
  });

  describe('POST /authorization/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPassword123!', salt);

      await User.create({
        fullName: 'Test User',
        userName: 'testuser',
        email: 'test@example.com',
        phonenumber: '123456789',
        password: hashedPassword,
        role: 'user',
      });
    });

    test('Should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/authorization/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.userName).toBe('testuser');
      expect(response.body.user.role).toBe('user');
      expect(response.body.message).toBe('Logged in successfully');
    });

    test('Should return 401 error with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      const response = await request(app)
        .post('/authorization/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid Email or Password');
    });

    test('Should return 401 error with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/authorization/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid Email or Password');
    });

    test('Should return 400 error when required fields are missing', async () => {
      const loginData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/authorization/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});