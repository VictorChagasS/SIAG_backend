/**
 * Unit tests for ListUnitsByClassUseCase
 *
 * @module UnitUseCaseTests
 */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { ListUnitsByClassUseCase } from '@/modules/units/domain/usecases/list-units-by-class.usecase';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('ListUnitsByClassUseCase', () => {
  let useCase: ListUnitsByClassUseCase;
  let mockUnitRepository: Partial<IUnitRepository>;
  let mockClassRepository: Partial<IClassRepository>;

  // Test data
  const mockTeacherId = 'teacher-123';
  const mockClassId = 'class-123';

  const mockClass = {
    id: mockClassId,
    name: 'Math Class',
    teacherId: mockTeacherId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUnits = [
    {
      id: 'unit-1',
      name: 'First Bimester',
      classId: mockClassId,
      typeFormula: 'simple',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'unit-2',
      name: 'Second Bimester',
      classId: mockClassId,
      averageFormula: '(N1 + N2) / 2',
      typeFormula: 'personalized',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    // Create mock implementations for repositories
    mockUnitRepository = {
      findByClassId: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Configure the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUnitsByClassUseCase,
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

    useCase = module.get<ListUnitsByClassUseCase>(ListUnitsByClassUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful units listing
   *
   * Verifies that the use case correctly retrieves all units for a class
   * when all validations pass.
   */
  it('should list all units for a class when all validations pass', async () => {
    // Arrange: Configure mocks for successful scenario
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByClassId = jest.fn().mockResolvedValue(mockUnits);

    // Act: Execute the use case
    const result = await useCase.execute(mockClassId, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByClassId).toHaveBeenCalledWith(mockClassId);
    expect(result).toEqual(mockUnits);
    expect(result).toHaveLength(2);
  });

  /**
   * Test for empty units list
   *
   * Verifies that the use case correctly returns an empty array
   * when the class has no units.
   */
  it('should return an empty array when the class has no units', async () => {
    // Arrange: Configure mocks for class with no units
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByClassId = jest.fn().mockResolvedValue([]);

    // Act: Execute the use case
    const result = await useCase.execute(mockClassId, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByClassId).toHaveBeenCalledWith(mockClassId);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  /**
   * Test for non-existent class scenario
   *
   * Verifies that the use case throws a NotFoundException when
   * the class doesn't exist.
   */
  it('should throw NotFoundException when class does not exist', async () => {
    // Arrange: Configure mock for non-existent class
    mockClassRepository.findById = jest.fn().mockResolvedValue(null);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockClassId, mockTeacherId)).rejects.toThrow(NotFoundException);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByClassId).not.toHaveBeenCalled();
  });

  /**
   * Test for permission validation
   *
   * Verifies that the use case throws a ForbiddenException when the teacher
   * attempting to list the units is not the owner of the class.
   */
  it('should throw ForbiddenException when teacher is not the class owner', async () => {
    // Arrange: Configure mocks for class with different teacher
    const classWithDifferentTeacher = { ...mockClass, teacherId: 'different-teacher-id' };
    mockClassRepository.findById = jest.fn().mockResolvedValue(classWithDifferentTeacher);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockClassId, mockTeacherId)).rejects.toThrow(ForbiddenException);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByClassId).not.toHaveBeenCalled();
  });
});
