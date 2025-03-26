/**
 * Tests for PrismaUserRepository
 *
 * These tests verify that the Prisma implementation of the user repository
 * is working correctly for CRUD operations.
 *
 * @module UserRepositoryTests
 */
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserSearchOptions } from '@/modules/users/domain/repositories/user-repository.interface';
import { PrismaUserRepository } from '@/modules/users/infra/prisma/repositories/prisma-user.repository';
import { PrismaService } from '@/prisma/prisma.service';

// IMPORTANTE: Este teste está projetado para falhar com a implementação atual do repositório
// Isso é para demonstrar que os testes são eficazes em detectar problemas

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  // Test data
  const mockUserId = 'user-123';
  const mockInstitutionId = 'institution-123';
  const mockUser: User = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    isAdmin: false,
    institutionId: mockInstitutionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Creation data
  const createUserData: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'plain_password',
    isAdmin: false,
    institutionId: mockInstitutionId,
  };

  beforeEach(async () => {
    // Create mocks for Prisma service
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    // Configure test module with REAL repository implementation
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Use the actual repository implementation, not a mock
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for user creation
   */
  describe('create', () => {
    it('should create a new user successfully and return the correct data', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        institution: { id: mockInstitutionId, name: 'Test Institution' },
      });

      try {
        // Act: Execute the method to be tested - This should throw with our buggy implementation
        const result = await repository.create(createUserData);

        // Verify actual implementation works as expected (this should not execute if there are bugs)
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: {
            name: createUserData.name,
            email: createUserData.email,
            password: createUserData.password,
            isAdmin: createUserData.isAdmin,
            institutionId: createUserData.institutionId,
          },
          include: {
            institution: true,
          },
        });
        expect(result).toEqual(expect.objectContaining({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        }));
      } catch (error) {
        // If we're testing the buggy implementation, this should show the error
        expect(error.message).toBe('Error creating user');
        throw error; // Re-throw to fail the test
      }
    });
  });

  /**
   * Test for finding user by email
   */
  describe('findByEmail', () => {
    it('should return a user when it exists with the specified email', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        institution: { id: mockInstitutionId, name: 'Test Institution' },
      });

      // Act: Execute the method to be tested
      const result = await repository.findByEmail(mockUser.email);

      // Assert: Verify expected behavior - this will fail with our buggy implementation
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe(mockUser.id);
        expect(result.email).toBe(mockUser.email);
      }
    });

    it('should return null when no user exists with the specified email', async () => {
      // Arrange: Configure mock for no results scenario
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findByEmail('nonexistent@example.com');

      // Assert: Verify expected behavior
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        include: {
          institution: true,
        },
      });
      expect(result).toBeNull();
    });
  });

  /**
   * Test for finding user by ID
   */
  describe('findById', () => {
    it('should return a user with the correct ID when it exists', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        institution: { id: mockInstitutionId, name: 'Test Institution' },
      });

      // Act: Execute the method to be tested
      const result = await repository.findById(mockUserId);

      // Assert: Verify expected behavior - this will fail with our buggy implementation
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe(mockUserId); // This will fail with the buggy implementation
      }
    });

    it('should return null when the user does not exist', async () => {
      // Arrange: Configure mock for failure scenario
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findById('nonexistent-id');

      // Assert: Verify expected behavior
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
        include: {
          institution: true,
        },
      });
      expect(result).toBeNull();
    });
  });

  /**
   * Test for updating user
   */
  describe('update', () => {
    it('should update a user successfully and not throw an error', async () => {
      // Arrange: Define update data and mock for success scenario
      const updateData = {
        name: 'Updated Name',
        email: 'updated.email@example.com',
      };
      const updatedUser = {
        ...mockUser,
        ...updateData,
        updatedAt: new Date(),
        institution: { id: mockInstitutionId, name: 'Test Institution' },
      };
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      try {
        // Act: Execute the method to be tested - This should throw with our buggy implementation
        const result = await repository.update(mockUserId, updateData);

        // This should only execute if there are no bugs
        expect(result).toEqual(expect.objectContaining({
          id: mockUser.id,
          name: updateData.name,
          email: updateData.email,
        }));
      } catch (error) {
        // If we're testing the buggy implementation, this should show the error
        expect(error.message).toBe('Error updating user');
        throw error; // Re-throw to fail the test
      }
    });
  });

  /**
   * Test for deleting user
   */
  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.user.delete as jest.Mock).mockResolvedValue(undefined);

      // Act: Execute the method to be tested
      await repository.delete(mockUserId);

      // Assert: Verify expected behavior
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });
  });

  /**
   * Test for finding all users
   */
  describe('findAll', () => {
    it('should return users from the database and not an empty array', async () => {
      // Arrange: Configure mock for success scenario
      const mockUsers = [
        { ...mockUser, institution: { id: mockInstitutionId, name: 'Test Institution' } },
        {
          ...mockUser,
          id: 'user-456',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          institution: { id: mockInstitutionId, name: 'Test Institution' },
        },
      ];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act: Execute the method to be tested
      const result = await repository.findAll();

      // Assert: This will fail with our buggy implementation which returns an empty array
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter users by search term', async () => {
      // Arrange: Configure mock for filtered search scenario
      const searchOptions: IUserSearchOptions = { search: 'jane' };
      const mockUsers = [{
        ...mockUser,
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        institution: { id: mockInstitutionId, name: 'Test Institution' },
      }];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act: Execute the method to be tested
      const result = await repository.findAll(searchOptions);

      // Assert: Verify expected behavior
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                contains: 'jane',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'jane',
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          institution: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Jane Smith');
    });
  });
});
