/**
 * Unit tests for the JwtAuthGuard
 *
 * @module AuthGuardTests
 */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  /**
   * Mock JWT payload
   */
  const mockPayload: IJwtPayload = {
    sub: 'user-123',
    email: 'user@example.com',
    isAdmin: false,
  };

  beforeEach(async () => {
    // Create mock implementation for JWT service
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    // Configure the test module with mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Creates a mock execution context with headers
   *
   * @param {string} [authHeader] - Optional authorization header value
   * @returns {ExecutionContext} Mocked execution context
   */
  function createMockExecutionContext(authHeader?: string): ExecutionContext {
    const mockRequest = {
      headers: {},
    } as Request;

    if (authHeader) {
      mockRequest.headers.authorization = authHeader;
    }

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  }

  /**
   * Test for successful token validation
   *
   * Verifies that the guard returns true and attaches the user info to the request
   * when a valid token is provided.
   */
  it('should pass validation for valid token', async () => {
    // Arrange: Setup mock context with valid token and successful JWT verification
    const context = createMockExecutionContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();
    jwtService.verifyAsync = jest.fn().mockResolvedValue(mockPayload);

    // Act: Execute the guard
    const result = await guard.canActivate(context);

    // Assert: Verify the expected behavior
    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(mockPayload);
  });

  /**
   * Test for missing token
   *
   * Verifies that the guard throws an UnauthorizedException when
   * no authorization header is provided.
   */
  it('should throw UnauthorizedException when token is missing', async () => {
    // Arrange: Setup mock context without authorization header
    const context = createMockExecutionContext();

    // Act & Assert: Verify that the guard throws the expected exception
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  /**
   * Test for invalid token type
   *
   * Verifies that the guard throws an UnauthorizedException when
   * the authorization header doesn't use "Bearer" scheme.
   */
  it('should throw UnauthorizedException when token type is not Bearer', async () => {
    // Arrange: Setup mock context with invalid token type
    const context = createMockExecutionContext('Basic invalid-token');

    // Act & Assert: Verify that the guard throws the expected exception
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  /**
   * Test for JWT verification failure
   *
   * Verifies that the guard throws an UnauthorizedException when
   * the JWT service fails to verify the token.
   */
  it('should throw UnauthorizedException when token verification fails', async () => {
    // Arrange: Setup mock context with valid token but failed JWT verification
    const context = createMockExecutionContext('Bearer valid-token');
    jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

    // Act & Assert: Verify that the guard throws the expected exception
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  /**
   * Test for incomplete JWT payload
   *
   * Verifies that the guard throws an UnauthorizedException when
   * the JWT payload doesn't contain required fields.
   */
  it('should throw UnauthorizedException when payload is incomplete', async () => {
    // Arrange: Setup mock context with valid token but incomplete payload
    const context = createMockExecutionContext('Bearer valid-token');
    jwtService.verifyAsync = jest.fn().mockResolvedValue({
      // Missing required "sub" field
      email: 'user@example.com',
      isAdmin: false,
    });

    // Act & Assert: Verify that the guard throws the expected exception
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  /**
   * Test for error details in UnauthorizedException
   *
   * Verifies that the UnauthorizedException contains the expected
   * detailed error structure.
   */
  it('should include proper error details in UnauthorizedException for missing token', async () => {
    // Arrange: Setup mock context without authorization header
    const context = createMockExecutionContext();

    // Act: Capture the exception
    let caughtError;
    try {
      await guard.canActivate(context);
    } catch (error) {
      caughtError = error;
    }

    // Assert: Verify the exception structure
    expect(caughtError).toBeInstanceOf(UnauthorizedException);
    expect(caughtError.response).toEqual({
      code: 'TOKEN_NOT_PROVIDED',
      title: 'Token não fornecido',
      detail: ['É necessário fornecer um token de autenticação'],
    });
  });
});
