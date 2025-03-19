/**
 * Tests for UpdateUserUseCase
 *
 * These tests verify that user update functionality works correctly,
 * including validation and error handling.
 *
 * @module UserUseCaseTests
 */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';
import { IUpdateUserDTO, UpdateUserUseCase } from '@/modules/users/domain/usecases/update-user.usecase';
import { USER_REPOSITORY } from '@/modules/users/users.providers';

// Mock bcrypt to control password hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('new_hashed_password'),
}));

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update the user name successfully', async () => {
      // Arrange: Configure update data and mocks
      const updateData: IUpdateUserDTO = {
        name: 'John Updated',
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedAt: new Date(),
      };

      // Configure mocks to return existing user and then the updated one
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockUserId, updateData);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      expect(repository.update).toHaveBeenCalledWith(mockUserId, updateData);
      expect(result).toEqual({
        before: mockUser,
        after: updatedUser,
      });
    });

    it('should update the user email successfully when the new email is not in use', async () => {
      // Arrange: Configure update data and mocks
      const updateData: IUpdateUserDTO = {
        email: 'john.updated@example.com',
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedAt: new Date(),
      };

      // Configure mocks: existing user, no user with the new email, after update
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.findByEmail as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockUserId, updateData);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      expect(repository.findByEmail).toHaveBeenCalledWith(updateData.email);
      expect(repository.update).toHaveBeenCalledWith(mockUserId, updateData);
      expect(result).toEqual({
        before: mockUser,
        after: updatedUser,
      });
    });

    it('should update the user password successfully, hashing the password', async () => {
      // Arrange: Configure update data and mocks
      const updateData: IUpdateUserDTO = {
        password: 'new_password123',
      };

      // The password in the database should be the hash, not the original value
      const updatedUser = {
        ...mockUser,
        password: 'new_hashed_password', // Mocked value from bcrypt.hash
        updatedAt: new Date(),
      };

      // Configure mocks
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockUserId, updateData);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      // Verify that the password was hashed before updating
      expect(repository.update).toHaveBeenCalledWith(mockUserId, {
        password: 'new_hashed_password',
      });
      expect(result).toEqual({
        before: mockUser,
        after: updatedUser,
      });
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      // Arrange: Configure mock to return null (user not found)
      (repository.findById as jest.Mock).mockResolvedValue(null);

      const updateData: IUpdateUserDTO = {
        name: 'New Name',
      };

      // Act & Assert: Execute and verify that exception is thrown
      await expect(useCase.execute('non-existent-id', updateData)).rejects.toThrow(NotFoundException);

      // Verify findById was called with correct ID
      expect(repository.findById).toHaveBeenCalledWith('non-existent-id');

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when trying to update to an email already in use', async () => {
      // Arrange: Configure update data and mocks
      const updateData: IUpdateUserDTO = {
        email: 'already.used@example.com',
      };

      const existingUserWithEmail: User = {
        id: 'another-user-id',
        name: 'Another User',
        email: updateData.email,
        password: 'some_hash',
        isAdmin: false,
        institutionId: 'institution-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Configure mocks: user exists, but another user already has the email
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.findByEmail as jest.Mock).mockResolvedValue(existingUserWithEmail);

      // Act & Assert: Execute and verify that exception is thrown
      await expect(useCase.execute(mockUserId, updateData)).rejects.toThrow(ConflictException);

      // Verify findById and findByEmail were called with correct parameters
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      expect(repository.findByEmail).toHaveBeenCalledWith(updateData.email);

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should not check for email duplicates when email is not being changed', async () => {
      // Arrange: Configure update data with same email
      const updateData: IUpdateUserDTO = {
        name: 'New Name',
        email: mockUser.email, // Same email that's already registered
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedAt: new Date(),
      };

      // Configure mocks
      (repository.findById as jest.Mock).mockResolvedValue(mockUser);
      (repository.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockUserId, updateData);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockUserId);
      // Verify that findByEmail was not called since the email didn't change
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(mockUserId, updateData);
      expect(result).toEqual({
        before: mockUser,
        after: updatedUser,
      });
    });
  });
});
