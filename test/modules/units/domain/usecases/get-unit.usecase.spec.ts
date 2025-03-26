/**
 * Unit tests for GetUnitUseCase
 *
 * @module UnitUseCaseTests
 */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { GetUnitUseCase } from '@/modules/units/domain/usecases/get-unit.usecase';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('GetUnitUseCase', () => {
  let useCase: GetUnitUseCase;
  let mockUnitRepository: Partial<IUnitRepository>;
  let mockClassRepository: Partial<IClassRepository>;

  // Test data
  const mockUnitId = 'unit-123';
  const mockTeacherId = 'teacher-123';
  const mockClassId = 'class-123';

  const mockUnit = {
    id: mockUnitId,
    name: 'First Bimester',
    classId: mockClassId,
    averageFormula: '(N1 + N2) / 2',
    typeFormula: 'simple',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClass = {
    id: mockClassId,
    name: 'Math Class',
    teacherId: mockTeacherId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock implementations for repositories
    mockUnitRepository = {
      findById: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Configure the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUnitUseCase,
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

    useCase = module.get<GetUnitUseCase>(GetUnitUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful unit retrieval
   *
   * Verifies that the use case correctly retrieves a unit when all validations pass.
   */
  it('should retrieve a unit when all validations pass', async () => {
    // Arrange: Configure mocks for successful scenario
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);

    // Act: Execute the use case
    const result = await useCase.execute(mockUnitId, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(result).toEqual(mockUnit);
  });

  /**
   * Test for non-existent unit scenario
   *
   * Verifies that the use case throws a NotFoundException when the unit doesn't exist.
   */
  it('should throw NotFoundException when unit does not exist', async () => {
    // Arrange: Configure mock for non-existent unit
    mockUnitRepository.findById = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockUnitId, mockTeacherId)).rejects.toThrow(NotFoundException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).not.toHaveBeenCalled();
  });

  /**
   * Test for non-existent class scenario
   *
   * Verifies that the use case throws a NotFoundException when the class doesn't exist.
   */
  it('should throw NotFoundException when class does not exist', async () => {
    // Arrange: Configure mocks for non-existent class
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockUnitId, mockTeacherId)).rejects.toThrow(NotFoundException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
  });

  /**
   * Test for permission validation
   *
   * Verifies that the use case throws a ForbiddenException when the teacher
   * attempting to retrieve the unit is not the owner of the class.
   */
  it('should throw ForbiddenException when teacher is not the class owner', async () => {
    // Arrange: Configure mocks for class with different teacher
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    const classWithDifferentTeacher = { ...mockClass, teacherId: 'different-teacher-id' };
    mockClassRepository.findById = jest.fn().mockResolvedValue(classWithDifferentTeacher);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockUnitId, mockTeacherId)).rejects.toThrow(ForbiddenException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
  });
});
