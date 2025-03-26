/**
 * Unit tests for CreateUnitUseCase
 *
 * @module UnitUseCaseTests
 */
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { CreateUnitUseCase, ICreateUnitDTO } from '@/modules/units/domain/usecases/create-unit.usecase';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('CreateUnitUseCase', () => {
  let useCase: CreateUnitUseCase;
  let mockUnitRepository: Partial<IUnitRepository>;
  let mockClassRepository: Partial<IClassRepository>;

  // Test data
  const mockTeacherId = 'teacher-123';
  const mockClassId = 'class-123';
  const mockUnitName = 'First Bimester';
  const mockAverageFormula = '(N1 + N2) / 2';

  const mockClass = {
    id: mockClassId,
    name: 'Math Class',
    teacherId: mockTeacherId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUnit = {
    id: 'unit-123',
    name: mockUnitName,
    classId: mockClassId,
    averageFormula: mockAverageFormula,
    typeFormula: 'simple',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createUnitDto: ICreateUnitDTO = {
    name: mockUnitName,
    classId: mockClassId,
    averageFormula: mockAverageFormula,
    teacherId: mockTeacherId,
  };

  beforeEach(async () => {
    // Create mock implementations for repositories
    mockUnitRepository = {
      create: jest.fn(),
      findByNameAndClassId: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Configure the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUnitUseCase,
        {
          provide: UNIT_REPOSITORY,
          useValue: mockUnitRepository,
        },
        {
          provide: CLASS_REPOSITORY,
          useValue: mockClassRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUnitUseCase>(CreateUnitUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful unit creation
   *
   * Verifies that the use case correctly creates a unit when all validations pass.
   */
  it('should create a unit when all validations pass', async () => {
    // Arrange: Configure mocks for successful scenario
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByNameAndClassId = jest.fn().mockResolvedValue(null);
    mockUnitRepository.create = jest.fn().mockImplementation((unit) => ({
      ...unit,
      id: 'unit-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Act: Execute the use case
    const result = await useCase.execute(createUnitDto);

    // Assert: Verify expected behavior
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).toHaveBeenCalledWith(mockUnitName, mockClassId);
    expect(mockUnitRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockUnitName,
        classId: mockClassId,
        averageFormula: mockAverageFormula,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        name: mockUnitName,
        classId: mockClassId,
        averageFormula: mockAverageFormula,
      }),
    );
  });

  /**
   * Test for non-existent class scenario
   *
   * Verifies that the use case throws a NotFoundException when the class doesn't exist.
   */
  it('should throw NotFoundException when class does not exist', async () => {
    // Arrange: Configure mock for non-existent class
    mockClassRepository.findById = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(createUnitDto)).rejects.toThrow(NotFoundException);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).not.toHaveBeenCalled();
    expect(mockUnitRepository.create).not.toHaveBeenCalled();
  });

  /**
   * Test for permission validation
   *
   * Verifies that the use case throws a ForbiddenException when the teacher
   * attempting to create the unit is not the owner of the class.
   */
  it('should throw ForbiddenException when teacher is not the class owner', async () => {
    // Arrange: Configure mock for class with different teacher
    const classWithDifferentTeacher = { ...mockClass, teacherId: 'different-teacher-id' };
    mockClassRepository.findById = jest.fn().mockResolvedValue(classWithDifferentTeacher);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(createUnitDto)).rejects.toThrow(ForbiddenException);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).not.toHaveBeenCalled();
    expect(mockUnitRepository.create).not.toHaveBeenCalled();
  });

  /**
   * Test for duplicate unit name validation
   *
   * Verifies that the use case throws a ConflictException when attempting
   * to create a unit with a name that already exists in the class.
   */
  it('should throw ConflictException when unit name already exists in the class', async () => {
    // Arrange: Configure mocks for duplicate unit name
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByNameAndClassId = jest.fn().mockResolvedValue(mockUnit);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(createUnitDto)).rejects.toThrow(ConflictException);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).toHaveBeenCalledWith(mockUnitName, mockClassId);
    expect(mockUnitRepository.create).not.toHaveBeenCalled();
  });
});
