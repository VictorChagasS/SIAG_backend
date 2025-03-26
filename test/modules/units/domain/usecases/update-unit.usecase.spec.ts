/**
 * Unit tests for UpdateUnitUseCase
 *
 * @module UnitUseCaseTests
 */
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { IUpdateUnitDTO, UpdateUnitUseCase } from '@/modules/units/domain/usecases/update-unit.usecase';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('UpdateUnitUseCase', () => {
  let useCase: UpdateUnitUseCase;
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

  const updateUnitDto: IUpdateUnitDTO = {
    name: 'Updated Bimester',
    averageFormula: '(N1 + N2 + N3) / 3',
  };

  const partialUpdateDto: IUpdateUnitDTO = {
    name: 'Updated Bimester',
  };

  beforeEach(async () => {
    // Create mock implementations for repositories
    mockUnitRepository = {
      findById: jest.fn(),
      findByNameAndClassId: jest.fn(),
      update: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Configure the test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUnitUseCase,
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

    useCase = module.get<UpdateUnitUseCase>(UpdateUnitUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for successful unit update
   *
   * Verifies that the use case correctly updates a unit when all validations pass.
   */
  it('should update a unit when all validations pass', async () => {
    // Arrange: Configure mocks for successful scenario
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByNameAndClassId = jest.fn().mockResolvedValue(null);
    mockUnitRepository.update = jest.fn().mockImplementation((id, data) => ({
      ...mockUnit,
      ...data,
      updatedAt: new Date(),
    }));

    // Act: Execute the use case
    const result = await useCase.execute(mockUnitId, updateUnitDto, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).toHaveBeenCalledWith(updateUnitDto.name, mockClassId);
    expect(mockUnitRepository.update).toHaveBeenCalledWith(mockUnitId, updateUnitDto);
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUnitId,
        name: updateUnitDto.name,
        averageFormula: updateUnitDto.averageFormula,
      }),
    );
  });

  /**
   * Test for partial unit update (only name)
   *
   * Verifies that the use case correctly handles partial updates.
   */
  it('should handle partial updates correctly', async () => {
    // Arrange: Configure mocks for successful partial update
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.findByNameAndClassId = jest.fn().mockResolvedValue(null);
    mockUnitRepository.update = jest.fn().mockImplementation((id, data) => ({
      ...mockUnit,
      ...data,
      updatedAt: new Date(),
    }));

    // Act: Execute the use case
    const result = await useCase.execute(mockUnitId, partialUpdateDto, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).toHaveBeenCalledWith(partialUpdateDto.name, mockClassId);
    expect(mockUnitRepository.update).toHaveBeenCalledWith(mockUnitId, partialUpdateDto);
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUnitId,
        name: partialUpdateDto.name,
        averageFormula: mockUnit.averageFormula, // Should keep the original formula
      }),
    );
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
    await expect(useCase.execute(mockUnitId, updateUnitDto, mockTeacherId)).rejects.toThrow(NotFoundException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).not.toHaveBeenCalled();
    expect(mockUnitRepository.update).not.toHaveBeenCalled();
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
    await expect(useCase.execute(mockUnitId, updateUnitDto, mockTeacherId)).rejects.toThrow(NotFoundException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.update).not.toHaveBeenCalled();
  });

  /**
   * Test for permission validation
   *
   * Verifies that the use case throws a ForbiddenException when the teacher
   * attempting to update the unit is not the owner of the class.
   */
  it('should throw ForbiddenException when teacher is not the class owner', async () => {
    // Arrange: Configure mocks for class with different teacher
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    const classWithDifferentTeacher = { ...mockClass, teacherId: 'different-teacher-id' };
    mockClassRepository.findById = jest.fn().mockResolvedValue(classWithDifferentTeacher);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockUnitId, updateUnitDto, mockTeacherId)).rejects.toThrow(ForbiddenException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.update).not.toHaveBeenCalled();
  });

  /**
   * Test for duplicate name validation
   *
   * Verifies that the use case throws a ConflictException when attempting
   * to update a unit with a name that already exists for another unit in the class.
   */
  it('should throw ConflictException when updated name already exists for another unit', async () => {
    // Arrange: Configure mocks for duplicate unit name
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    const existingUnitWithSameName = {
      ...mockUnit,
      id: 'another-unit-id', // Different ID
      name: updateUnitDto.name,
    };
    mockUnitRepository.findByNameAndClassId = jest.fn().mockResolvedValue(existingUnitWithSameName);

    // Act & Assert: Verify that the use case throws the expected exception
    await expect(useCase.execute(mockUnitId, updateUnitDto, mockTeacherId)).rejects.toThrow(ConflictException);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).toHaveBeenCalledWith(updateUnitDto.name, mockClassId);
    expect(mockUnitRepository.update).not.toHaveBeenCalled();
  });

  /**
   * Test for same name validation
   *
   * Verifies that the use case allows updating with the same name as the current unit.
   */
  it('should allow updating with the same name as the current unit', async () => {
    // Arrange: Configure mocks for updating with the same name
    const sameNameUpdateDto = {
      name: mockUnit.name,
      averageFormula: '(N1 + N2 + N3) / 3',
    };
    mockUnitRepository.findById = jest.fn().mockResolvedValue(mockUnit);
    mockClassRepository.findById = jest.fn().mockResolvedValue(mockClass);
    mockUnitRepository.update = jest.fn().mockImplementation((id, data) => ({
      ...mockUnit,
      ...data,
      updatedAt: new Date(),
    }));

    // Act: Execute the use case
    const result = await useCase.execute(mockUnitId, sameNameUpdateDto, mockTeacherId);

    // Assert: Verify expected behavior
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockUnitRepository.findByNameAndClassId).not.toHaveBeenCalled(); // Should not check for duplicates with same name
    expect(mockUnitRepository.update).toHaveBeenCalledWith(mockUnitId, sameNameUpdateDto);
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUnitId,
        name: sameNameUpdateDto.name,
        averageFormula: sameNameUpdateDto.averageFormula,
      }),
    );
  });
});
