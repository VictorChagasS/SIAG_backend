/**
 * Unit tests for the GetMeUseCase
 *
 * @module AuthUseCaseTests
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { GetMeUseCase } from '@/modules/auth/domain/usecases/get-me.usecase';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;
  let mockUserRepository: Partial<IUserRepository>;

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
   * JWT payload for authenticated user
   */
  const mockJwtPayload: IJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    isAdmin: mockUser.isAdmin,
  };

  /**
   * Expected user response (without password)
   */
  const expectedUserResponse = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    isAdmin: mockUser.isAdmin,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    // Create mock implementation for user repository
    mockUserRepository = {
      findById: jest.fn(),
    };

    // Configure the test module with mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetMeUseCase,
          useFactory: () => new GetMeUseCase(mockUserRepository as IUserRepository),
        },
      ],
    }).compile();

    useCase = module.get<GetMeUseCase>(GetMeUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful retrieval of user profile
   *
   * Verifies that the use case returns user data with password excluded
   * when a valid JWT payload is provided.
   */
  it('should return user data when user exists', async () => {
    // Arrange: Configure mock for successful user retrieval
    mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);

    // Act: Execute the use case
    const result = await useCase.execute(mockJwtPayload);

    // Assert: Verify the expected behavior
    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
    expect(result).toEqual(expectedUserResponse);
    expect(result).not.toHaveProperty('password');
  });

  /**
   * Test for user not found scenario
   *
   * Verifies that the use case throws a NotFoundException when
   * the user ID from the JWT payload doesn't match any user.
   */
  it('should throw NotFoundException when user does not exist', async () => {
    // Arrange: Configure mock for non-existent user
    mockUserRepository.findById = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockJwtPayload)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
  });

  /**
   * Test for proper error details in NotFoundException
   *
   * Verifies that the NotFoundException contains the expected
   * detailed error structure.
   */
  it('should include proper error details in NotFoundException', async () => {
    // Arrange: Configure mock for non-existent user
    mockUserRepository.findById = jest.fn().mockResolvedValue(null);

    // Act: Capture the exception
    let caughtError;
    try {
      await useCase.execute(mockJwtPayload);
    } catch (error) {
      caughtError = error;
    }

    // Assert: Verify the exception structure
    expect(caughtError).toBeInstanceOf(NotFoundException);
    expect(caughtError.response).toEqual({
      code: 'USER_NOT_FOUND',
      title: 'User not found',
      detail: ['The requested user was not found'],
    });
  });
});
