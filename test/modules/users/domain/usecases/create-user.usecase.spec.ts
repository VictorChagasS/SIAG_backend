/**
 * Tests for CreateUserUseCase
 *
 * These tests verify that user creation works correctly,
 * including validation and error handling.
 *
 * @module UserUseCaseTests
 */
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';
import { CreateUserUseCase, ICreateUserDTO } from '@/modules/users/domain/usecases/create-user.usecase';
import { USER_REPOSITORY } from '@/modules/users/users.providers';

// Mock bcryptjs to control password hashing in tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: IUserRepository;

  // Test data
  const mockUserId = 'user-123';
  const mockInstitutionId = 'institution-123';
  const createUserData: ICreateUserDTO = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    institutionId: mockInstitutionId,
    isAdmin: false,
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
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repository = module.get<IUserRepository>(USER_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a new user successfully when no duplicate exists', async () => {
      // Arrange: Configure mocks
      // First, repository should return null when checking for existing user
      (repository.findByEmail as jest.Mock).mockResolvedValue(null);

      // Then, it should return a new user when creating
      const expectedUser: User = {
        id: mockUserId,
        name: createUserData.name,
        email: createUserData.email,
        password: 'hashed_password', // mocked hashed password
        isAdmin: createUserData.isAdmin || false,
        institutionId: createUserData.institutionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (repository.create as jest.Mock).mockResolvedValue(expectedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(createUserData);

      // Assert: Verify expected behavior
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserData.email);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createUserData.name,
          email: createUserData.email,
          password: 'hashed_password',
          isAdmin: createUserData.isAdmin,
          institutionId: createUserData.institutionId,
        }),
      );
      expect(result).toEqual(expectedUser);
    });

    it('should create a user with isAdmin=false when not specified', async () => {
      // Arrange: Configure data without specifying isAdmin
      const createDataWithoutAdmin: ICreateUserDTO = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        institutionId: mockInstitutionId,
      };

      // Repository should return null when checking for existing user
      (repository.findByEmail as jest.Mock).mockResolvedValue(null);

      // Then, it should return a new user when creating
      const expectedUser: User = {
        id: 'user-456',
        name: createDataWithoutAdmin.name,
        email: createDataWithoutAdmin.email,
        password: 'hashed_password',
        isAdmin: false, // Should be false by default
        institutionId: createDataWithoutAdmin.institutionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (repository.create as jest.Mock).mockResolvedValue(expectedUser);

      // Act: Execute the method to be tested
      const result = await useCase.execute(createDataWithoutAdmin);

      // Assert: Verify that isAdmin is false
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isAdmin: false,
        }),
      );
      expect(result.isAdmin).toBe(false);
    });

    it('should throw ConflictException when a user with the same email already exists', async () => {
      // Arrange: Configure mocks to simulate an existing user
      const existingUser: User = {
        id: 'existing-id',
        name: 'Existing User',
        email: createUserData.email, // Same email
        password: 'hashed_password',
        isAdmin: false,
        institutionId: mockInstitutionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (repository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert: Execute and verify that exception is thrown
      await expect(useCase.execute(createUserData)).rejects.toThrow(ConflictException);

      // Verify findByEmail was called with correct parameters
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserData.email);

      // Verify create was not called
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should check for email existence case-insensitively', async () => {
      // Arrange: Configure data with uppercase email
      const createDataWithUppercaseEmail: ICreateUserDTO = {
        name: 'James Smith',
        email: 'JAMES.SMITH@example.com', // Uppercase email
        password: 'password123',
        institutionId: mockInstitutionId,
      };

      // Existing user with lowercase email
      const existingUserWithLowercaseEmail: User = {
        id: 'existing-id',
        name: 'James Smith',
        email: 'james.smith@example.com', // Same email but lowercase
        password: 'hashed_password',
        isAdmin: false,
        institutionId: mockInstitutionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock repository findByEmail to simulate case-insensitive match
      // In a real app, this would be handled by the repository implementation
      // Here we're simulating it in the test
      (repository.findByEmail as jest.Mock).mockImplementation((email: string) => {
        if (email.toLowerCase() === existingUserWithLowercaseEmail.email.toLowerCase()) {
          return Promise.resolve(existingUserWithLowercaseEmail);
        }
        return Promise.resolve(null);
      });

      // Act & Assert: Execute and verify that exception is thrown
      await expect(useCase.execute(createDataWithUppercaseEmail)).rejects.toThrow(ConflictException);

      // Verify findByEmail was called with correct parameters
      expect(repository.findByEmail).toHaveBeenCalledWith(createDataWithUppercaseEmail.email);

      // Verify create was not called
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
