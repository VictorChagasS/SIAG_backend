/**
 * Unit tests for the AuthenticateUserUseCase
 *
 * @module AuthUseCaseTests
 */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AuthenticateUserUseCase } from '@/modules/auth/domain/usecases/authenticate-user.usecase';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

// Mock bcrypt to control its behavior in tests
jest.mock('bcrypt');

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let mockUserRepository: Partial<IUserRepository>;
  let mockJwtService: Partial<JwtService>;

  /**
   * Test user data
   */
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed-password',
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Authentication credentials
   */
  const mockCredentials = {
    email: 'john.doe@example.com',
    password: 'password123',
  };

  /**
   * JWT payload used for token generation
   */
  const mockJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    isAdmin: mockUser.isAdmin,
  };

  /**
   * Expected authentication response
   */
  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    user: {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      isAdmin: mockUser.isAdmin,
    },
  };

  beforeEach(async () => {
    // Create mock implementations for dependencies
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    };

    // Configure the test module with mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthenticateUserUseCase,
          useFactory: () => new AuthenticateUserUseCase(
            mockUserRepository as IUserRepository,
            mockJwtService as JwtService,
          ),
        },
      ],
    }).compile();

    useCase = module.get<AuthenticateUserUseCase>(AuthenticateUserUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful authentication
   *
   * Verifies that the use case returns a valid token and user data
   * when credentials are valid.
   */
  it('should authenticate a user with valid credentials', async () => {
    // Arrange: Configure mocks for successful authentication
    mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Act: Execute the use case
    const result = await useCase.execute(mockCredentials);

    // Assert: Verify the expected behavior
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.password);
    expect(mockJwtService.sign).toHaveBeenCalledWith(mockJwtPayload, {
      secret: process.env.JWT_SECRET,
    });
    expect(result).toEqual(mockAuthResponse);
  });

  /**
   * Test for authentication with non-existent user
   *
   * Verifies that the use case throws an UnauthorizedException when
   * a user with the provided email doesn't exist.
   */
  it('should throw UnauthorizedException when user does not exist', async () => {
    // Arrange: Configure mocks for non-existent user
    mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockCredentials)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  /**
   * Test for authentication with invalid password
   *
   * Verifies that the use case throws an UnauthorizedException when
   * the password provided doesn't match the stored password.
   */
  it('should throw UnauthorizedException when password is incorrect', async () => {
    // Arrange: Configure mocks for invalid password
    mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockCredentials)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockCredentials.email);
    expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentials.password, mockUser.password);
    expect(mockJwtService.sign).not.toHaveBeenCalled();
  });

  /**
   * Test for authentication with detailed error structure
   *
   * Verifies that the UnauthorizedException contains the expected
   * detailed error structure.
   */
  it('should include proper error details in UnauthorizedException', async () => {
    // Arrange: Configure mocks for failed authentication
    mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act: Capture the exception
    let caughtError;
    try {
      await useCase.execute(mockCredentials);
    } catch (error) {
      caughtError = error;
    }

    // Assert: Verify the exception structure
    expect(caughtError).toBeInstanceOf(UnauthorizedException);
    expect(caughtError.response).toEqual({
      code: 'INVALID_CREDENTIALS',
      title: 'Credenciais inválidas',
      detail: ['Email ou senha incorretos'],
    });
  });
});
