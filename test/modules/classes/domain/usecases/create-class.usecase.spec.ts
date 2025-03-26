/**
 * Tests for CreateClassUseCase
 *
 * These tests verify that the creation of classes works correctly
 * including validation and error handling.
 *
 * @module ClassUseCaseTests
 */
import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { Class, ITypeFormula } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CreateClassUseCase } from '@/modules/classes/domain/usecases/create-class.usecase';

describe('CreateClassUseCase', () => {
  let useCase: CreateClassUseCase;
  let repository: IClassRepository;

  // Test data
  const mockTeacherId = 'teacher-123';
  const mockClassId = 'class-123';
  const createClassData = {
    name: 'Mathematics 101',
    code: 'MATH101',
    period: '2023.1',
    teacherId: mockTeacherId,
    section: 1,
    typeFormula: 'simple' as ITypeFormula,
  };

  beforeEach(async () => {
    // Create mock repository with method implementations
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
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
        CreateClassUseCase,
        {
          provide: CLASS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateClassUseCase>(CreateClassUseCase);
    repository = module.get<IClassRepository>(CLASS_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a new class successfully when no duplicate exists', async () => {
      // Arrange: Configure mocks
      // First, the repository should return null when checking for existing class
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(null);

      // Then, it should return a new class when creating
      const expectedClass: Class = {
        id: mockClassId,
        ...createClassData,
        studentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (repository.create as jest.Mock).mockResolvedValue(expectedClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(createClassData);

      // Assert: Verify expected behavior
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        createClassData.name,
        createClassData.period,
        createClassData.teacherId,
        createClassData.section,
      );
      expect(repository.create).toHaveBeenCalledWith(createClassData);
      expect(result).toEqual(expectedClass);
    });

    it('should throw ConflictException when a class with the same details already exists', async () => {
      // Arrange: Configure mocks to simulate an existing class
      const existingClass: Class = {
        id: mockClassId,
        ...createClassData,
        studentCount: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(existingClass);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(createClassData)).rejects.toThrow(ConflictException);

      // Verify findByNamePeriodAndTeacher was called with correct parameters
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        createClassData.name,
        createClassData.period,
        createClassData.teacherId,
        createClassData.section,
      );

      // Verify create was not called
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
