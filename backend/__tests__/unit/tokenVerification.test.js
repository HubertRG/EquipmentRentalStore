const jwt = require('jsonwebtoken');
const tokenVerification = require('../../src/middleware/tokenVerification');

// Mock dotenv
process.env.JWTPRIVATEKEY = 'test-secret-key';

describe('TokenVerification Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should return 403 when Authorization header is missing', () => {
    tokenVerification(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Brak tokenu autoryzacyjnego',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should return 403 when header does not start with "Bearer "', () => {
    req.headers.authorization = 'InvalidToken';

    tokenVerification(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Brak tokenu autoryzacyjnego',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should return 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token';

    tokenVerification(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Nieprawidłowy token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('Should successfully verify valid token and call next()', () => {
    const userData = {
      _id: '123456789',
      email: 'test@example.com',
      role: 'user',
    };

    const token = jwt.sign(userData, process.env.JWTPRIVATEKEY, {
      expiresIn: '7d',
    });

    req.headers.authorization = `Bearer ${token}`;

    tokenVerification(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user._id).toBe(userData._id);
    expect(req.user.email).toBe(userData.email);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('Should return 401 when token has expired', () => {
    const userData = {
      _id: '123456789',
      email: 'test@example.com',
      role: 'user',
    };

    // Create expired token
    const expiredToken = jwt.sign(userData, process.env.JWTPRIVATEKEY, {
      expiresIn: '-1s',
    });

    req.headers.authorization = `Bearer ${expiredToken}`;

    tokenVerification(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Nieprawidłowy token',
    });
    expect(next).not.toHaveBeenCalled();
  });
});