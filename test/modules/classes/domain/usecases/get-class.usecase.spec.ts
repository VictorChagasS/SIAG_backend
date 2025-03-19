/**
 * Tests for GetClassUseCase
 *
 * These tests verify that retrieval of a class by ID works correctly
 * including error handling for non-existent classes.
 *
 * @module ClassUseCaseTests
 */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { Class, ITypeFormula } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { GetClassUseCase } from '@/modules/classes/domain/usecases/get-class.usecase';

describe('GetClassUseCase', () => {
  let useCase: GetClassUseCase;
  let repository: IClassRepository;

  // Test data
  const mockClassId = 'class-123';
  const mockTeacherId = 'teacher-123';
  const mockClass: Class = {
    id: mockClassId,
    name: 'Mathematics 101',
    code: 'MATH101',
    section: 1,
    period: '2023.1',
    teacherId: mockTeacherId,
    typeFormula: 'simple' as ITypeFormula,
    studentCount: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock repository
    const mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findByNamePeriodAndTeacher: jest.fn(),
      findByTeacherId: jest.fn(),
      findActiveByTeacherId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Configure test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassUseCase,
        {
          provide: CLASS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetClassUseCase>(GetClassUseCase);
    repository = module.get<IClassRepository>(CLASS_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a class when it exists', async () => {
      // Arrange: Configure mocks for success scenario
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockClassId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException when the class does not exist', async () => {
      // Arrange: Configure mocks for failure scenario
      (repository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute('nonexistent-id')).rejects.toThrow(NotFoundException);

      // Verify findById was called with the correct ID
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
