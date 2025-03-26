/**
 * Tests for DeleteUserUseCase
 *
 * These tests verify that user deletion works correctly,
 * including error handling when the user doesn't exist.
 *
 * @module UserUseCaseTests
 */
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';
import { DeleteUserUseCase } from '@/modules/users/domain/usecases/delete-user.usecase';
import { USER_REPOSITORY } from '@/modules/users/users.providers';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
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
        DeleteUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete a user successfully when it exists', async () => {
      // Arrange: Configure mock to return the user
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.delete as jest.Mock).mockResolvedValue(undefined);

      // Act: Execute the method to be tested
      await useCase.execute(mockUserId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      expect(repository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw an error when the user does not exist', async () => {
      // Arrange: Configure mock to return null (user not found)
      (repository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert: Execute and verify that error is thrown
      await expect(useCase.execute('non-existent-id')).rejects.toThrow('Usuário não encontrado');

      // Verify findById was called with the correct ID
      expect(repository.findById).toHaveBeenCalledWith('non-existent-id');

      // Verify delete was not called
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
