const { User, validate } = require('../../src/models/User');
const jwt = require('jsonwebtoken');

process.env.JWTPRIVATEKEY = 'test-secret-key';

describe('User Model - Unit Tests', () => {
  describe('User Data Validation', () => {
    test('Should accept valid user data', () => {
      const validUser = {
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      const { error } = validate(validUser);
      expect(error).toBeUndefined();
    });

    test('Should reject data without fullName', () => {
      const invalidUser = {
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      const { error } = validate(invalidUser);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('fullName');
    });

    test('Should reject invalid email', () => {
      const invalidUser = {
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'invalid-email',
        phonenumber: '123456789',
        password: 'SecurePass123!',
      };

      const { error } = validate(invalidUser);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    test('Should reject password that is too short (less than 8 characters)', () => {
      const invalidUser = {
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'short',
      };

      const { error } = validate(invalidUser);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });
  });

  describe('JWT Token Generation', () => {
    test('Should generate a valid JWT token', () => {
      const user = new User({
        _id: '507f1f77bcf86cd799439011',
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'hashedPassword',
        role: 'user',
      });

      const token = user.generateAuthToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      expect(decoded._id).toBe(user._id.toString());
    });

    test('Token should contain all required fields', () => {
      const user = new User({
        _id: '507f1f77bcf86cd799439011',
        fullName: 'Admin User',
        userName: 'adminuser',
        email: 'admin@example.com',
        phonenumber: '987654321',
        password: 'hashedPassword',
        role: 'admin',
      });

      const token = user.generateAuthToken();
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

      expect(decoded).toHaveProperty('_id');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });
  });

  describe('User Creation', () => {
    test('Should create user with default "user" role', () => {
      const user = new User({
        fullName: 'John Doe',
        userName: 'johndoe',
        email: 'john@example.com',
        phonenumber: '123456789',
        password: 'hashedPassword',
      });

      expect(user.role).toBe('user');
    });

    test('Should create user with "admin" role', () => {
      const user = new User({
        fullName: 'Admin User',
        userName: 'adminuser',
        email: 'admin@example.com',
        phonenumber: '987654321',
        password: 'hashedPassword',
        role: 'admin',
      });

      expect(user.role).toBe('admin');
    });
  });
});