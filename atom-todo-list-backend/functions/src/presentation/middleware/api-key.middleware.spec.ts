import { Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from './api-key.middleware';

// Override environment for tests
process.env['API_SECRET_KEY'] = 'test-secret';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('apiKeyMiddleware', () => {
  it('calls next() when the API key is valid', () => {
    const req = { headers: { 'x-api-key': 'test-secret' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    apiKeyMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key is missing', () => {
    const req = { headers: {} } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    apiKeyMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key is wrong', () => {
    const req = { headers: { 'x-api-key': 'wrong-key' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    apiKeyMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
