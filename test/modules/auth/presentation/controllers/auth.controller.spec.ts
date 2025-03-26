/**
 * Unit tests for the AuthController
 *
 * @module AuthControllerTests
 */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { AuthenticateUserUseCase } from '@/modules/auth/domain/usecases/authenticate-user.usecase';
import { GetMeUseCase } from '@/modules/auth/domain/usecases/get-me.usecase';
import { AuthController } from '@/modules/auth/presentation/controllers/auth.controller';

// Mock JwtAuthGuard to avoid external dependencies in tests
jest.mock('@/modules/auth/domain/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthenticateUserUseCase: Partial<AuthenticateUserUseCase>;
  let mockGetMeUseCase: Partial<GetMeUseCase>;
  let mockJwtService: Partial<JwtService>;

  // Test data
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    accessToken: 'mock-jwt-token',
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      isAdmin: mockUser.isAdmin,
    },
  };

  const mockLoginDto = {
    email: 'john.doe@example.com',
    password: 'password123',
  };

  const mockJwtPayload: IJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    isAdmin: mockUser.isAdmin,
  };

  beforeEach(async () => {
    // Create mocks for use cases
    mockAuthenticateUserUseCase = {
      execute: jest.fn(),
    };

    mockGetMeUseCase = {
      execute: jest.fn(),
    };

    // Mock JwtService
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    // Configure the test module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticateUserUseCase,
          useValue: mockAuthenticateUserUseCase,
        },
        {
          provide: GetMeUseCase,
          useValue: mockGetMeUseCase,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  /**
   * Tests for login endpoint
   */
  describe('login', () => {
    it('should authenticate a user with valid credentials', async () => {
      // Arrange: Configure mock for successful authentication
      mockAuthenticateUserUseCase.execute = jest.fn().mockResolvedValue(mockAuthResponse);

      // Act: Execute the endpoint
      const result = await controller.login(mockLoginDto);

      // Assert: Verify the result
      expect(mockAuthenticateUserUseCase.execute).toHaveBeenCalledWith({
        email: mockLoginDto.email,
        password: mockLoginDto.password,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange: Configure mock for authentication failure
      const mockError = new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        title: 'Invalid credentials',
        detail: ['Email or password incorrect'],
      });
      mockAuthenticateUserUseCase.execute = jest.fn().mockRejectedValue(mockError);

      // Act & Assert: Execute and verify that exception is thrown
      await expect(controller.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthenticateUserUseCase.execute).toHaveBeenCalledWith({
        email: mockLoginDto.email,
        password: mockLoginDto.password,
      });
    });
  });

  /**
   * Tests for current user profile endpoint
   */
  describe('me', () => {
    it('should return user data when authenticated', async () => {
      // Arrange: Configure mock for successful user retrieval
      mockGetMeUseCase.execute = jest.fn().mockResolvedValue(mockUser);

      // Act: Execute the endpoint
      const result = await controller.me(mockJwtPayload);

      // Assert: Verify the result
      expect(mockGetMeUseCase.execute).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual(mockUser);
    });

    it('should propagate exceptions from the use case', async () => {
      // Arrange: Configure mock for error scenario
      const mockError = new UnauthorizedException('User not found');
      mockGetMeUseCase.execute = jest.fn().mockRejectedValue(mockError);

      // Act & Assert: Execute and verify that exception is propagated
      await expect(controller.me(mockJwtPayload)).rejects.toThrow(UnauthorizedException);
      expect(mockGetMeUseCase.execute).toHaveBeenCalledWith(mockJwtPayload);
    });
  });
});
