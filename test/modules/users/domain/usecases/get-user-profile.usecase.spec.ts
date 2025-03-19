/**
 * Tests for GetUserProfileUseCase
 *
 * These tests verify that user profile retrieval works correctly,
 * including error handling when the user doesn't exist.
 *
 * @module UserUseCaseTests
 */
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';
import { GetUserProfileUseCase } from '@/modules/users/domain/usecases/get-user-profile.usecase';
import { USER_REPOSITORY } from '@/modules/users/users.providers';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let repository: IUserRepository;

  // Test data
  const mockUserId = 'user-123';
  const mockUser: User = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    isAdmin: false,
    institutionId: 'institution-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create repository mock with method implementations
    const mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Configure test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return the user profile when it exists', async () => {
      // Arrange: Configure mock to return the user
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockUserId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(mockUserId);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw an error when the user does not exist', async () => {
      // Arrange: Configure mock to return null (user not found)
      (repository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert: Execute and verify that error is thrown
      await expect(useCase.execute('non-existent-id')).rejects.toThrow('Usuário não encontrado');

      // Verify findById was called with the correct ID
      expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
