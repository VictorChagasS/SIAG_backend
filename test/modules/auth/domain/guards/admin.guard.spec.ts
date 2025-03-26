/**
 * Unit tests for the AdminGuard
 *
 * @module AuthGuardTests
 */
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { AdminGuard } from '@/modules/auth/domain/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

// Mock JwtAuthGuard to control its behavior in tests
jest.mock('@/modules/auth/domain/guards/jwt-auth.guard');

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockJwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock for JwtAuthGuard
    (JwtAuthGuard as jest.Mock).mockImplementation(() => ({
      canActivate: jest.fn().mockResolvedValue(true),
    }));

    // Create mock implementation for JWT service
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    // Configure the test module with mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    mockJwtAuthGuard = (JwtAuthGuard as unknown as jest.Mock).mock.results[0].value;
  });

  /**
   * Creates a mock execution context with a user payload
   *
   * @param {boolean} isAdmin - Whether the user has admin privileges
   * @returns {ExecutionContext} Mocked execution context
   */
  function createMockExecutionContext(isAdmin: boolean): ExecutionContext {
    const mockUser: IJwtPayload = {
      sub: 'user-123',
      email: 'user@example.com',
      isAdmin,
    };

    const mockRequest = {
      user: mockUser,
    } as unknown as Request;

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  }

  /**
   * Test for successful admin validation
   *
   * Verifies that the guard returns true when an admin user is authenticated.
   */
  it('should allow access for admin users', async () => {
    // Arrange: Setup mock context with admin user
    const context = createMockExecutionContext(true);

    // Act: Execute the guard
    const result = await guard.canActivate(context);

    // Assert: Verify the expected behavior
    expect(mockJwtAuthGuard.canActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);
  });

  /**
   * Test for non-admin access attempt
   *
   * Verifies that the guard throws a ForbiddenException when
   * a non-admin user attempts to access a protected resource.
   */
  it('should deny access for non-admin users', async () => {
    // Arrange: Setup mock context with non-admin user
    const context = createMockExecutionContext(false);

    // Act & Assert: Verify that the guard throws the expected exception
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(mockJwtAuthGuard.canActivate).toHaveBeenCalledWith(context);
  });

  /**
   * Test for error propagation from JwtAuthGuard
   *
   * Verifies that errors from JwtAuthGuard are properly propagated
   * without attempting to check admin status.
   */
  it('should propagate errors from JwtAuthGuard', async () => {
    // Arrange: Setup mock context and authentication error
    const context = createMockExecutionContext(true);
    const authError = new Error('Authentication failed');
    mockJwtAuthGuard.canActivate.mockRejectedValue(authError);

    // Act & Assert: Verify that the error is propagated
    await expect(guard.canActivate(context)).rejects.toThrow(authError);
    expect(mockJwtAuthGuard.canActivate).toHaveBeenCalledWith(context);
  });

  /**
   * Test for proper error message in ForbiddenException
   *
   * Verifies that the ForbiddenException contains the expected error message.
   */
  it('should include proper error message in ForbiddenException', async () => {
    // Arrange: Setup mock context with non-admin user
    const context = createMockExecutionContext(false);

    // Act: Capture the exception
    let caughtError;
    try {
      await guard.canActivate(context);
    } catch (error) {
      caughtError = error;
    }

    // Assert: Verify the exception message
    expect(caughtError).toBeInstanceOf(ForbiddenException);
    expect(caughtError.message).toBe('Access denied. Only administrators can access this resource.');
  });
});
