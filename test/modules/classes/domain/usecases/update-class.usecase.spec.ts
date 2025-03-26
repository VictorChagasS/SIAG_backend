/**
 * Tests for UpdateClassUseCase
 *
 * These tests verify that updating a class works correctly
 * including validation and error handling.
 *
 * @module ClassUseCaseTests
 */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { Class, ITypeFormula } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUpdateClassDTO, UpdateClassUseCase } from '@/modules/classes/domain/usecases/update-class.usecase';

describe('UpdateClassUseCase', () => {
  let useCase: UpdateClassUseCase;
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
      findByNamePeriodAndTeacher: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findByTeacherId: jest.fn(),
      findActiveByTeacherId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    // Configure test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassUseCase,
        {
          provide: CLASS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateClassUseCase>(UpdateClassUseCase);
    repository = module.get<IClassRepository>(CLASS_REPOSITORY);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update a class successfully when changing name', async () => {
      // Arrange: Define update data and configure mocks for success
      const updateData: IUpdateClassDTO = {
        name: 'Advanced Mathematics',
      };

      const updatedClass = {
        ...mockClass,
        ...updateData,
        code: 'MATH201', // Apenas para o mock do resultado
        updatedAt: new Date(),
      };

      // Mock repository to return the existing class and no conflicts
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(updatedClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockClassId, updateData, mockTeacherId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        updateData.name,
        mockClass.period,
        mockClass.teacherId,
        mockClass.section,
      );
      expect(repository.update).toHaveBeenCalledWith(mockClassId, updateData);
      expect(result).toEqual(updatedClass);
    });

    it('should update a class successfully when changing section', async () => {
      // Arrange: Define update data and configure mocks for success
      const updateData: IUpdateClassDTO = {
        section: 2,
      };

      const updatedClass = {
        ...mockClass,
        ...updateData,
        updatedAt: new Date(),
      };

      // Mock repository to return the existing class and no conflicts
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(updatedClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockClassId, updateData, mockTeacherId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        mockClass.name,
        mockClass.period,
        mockClass.teacherId,
        updateData.section,
      );
      expect(repository.update).toHaveBeenCalledWith(mockClassId, updateData);
      expect(result).toEqual(updatedClass);
    });

    it('should update a class successfully when changing period', async () => {
      // Arrange: Define update data and configure mocks for success
      const updateData: IUpdateClassDTO = {
        period: '2023.2',
      };

      const updatedClass = {
        ...mockClass,
        ...updateData,
        updatedAt: new Date(),
      };

      // Mock repository to return the existing class and no conflicts
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(updatedClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockClassId, updateData, mockTeacherId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        mockClass.name,
        updateData.period,
        mockClass.teacherId,
        mockClass.section,
      );
      expect(repository.update).toHaveBeenCalledWith(mockClassId, updateData);
      expect(result).toEqual(updatedClass);
    });

    it('should throw NotFoundException when the class does not exist', async () => {
      // Arrange: Configure mocks for non-existent class
      (repository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute('nonexistent-id', { name: 'New Name' }, mockTeacherId)).rejects.toThrow(NotFoundException);

      // Verify findById was called with the correct ID
      expect(repository.findById).toHaveBeenCalledWith('nonexistent-id');

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when name update would create a duplicate class', async () => {
      // Arrange: Configure mocks for duplicate conflict
      const newClassName = 'Physics 101';
      const updateData: IUpdateClassDTO = {
        name: newClassName,
      };

      const existingClass = {
        ...mockClass,
        id: 'different-id',
        name: newClassName,
      };

      // Mock repository to return the existing class and a conflict
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);

      // Use mockImplementation para simular o comportamento real do método
      // Isso vai retornar existingClass apenas quando o nome for igual a newClassName
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockImplementation(
        (name) => {
          if (name === newClassName) {
            return Promise.resolve(existingClass);
          }
          return Promise.resolve(null);
        },
      );

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(mockClassId, updateData, mockTeacherId)).rejects.toThrow(ConflictException);

      // Verify methods were called with correct parameters
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        updateData.name,
        mockClass.period,
        mockClass.teacherId,
        mockClass.section,
      );

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });

    // Vamos adicionar um teste para verificar que não lança exceção quando os nomes são diferentes
    it('should not throw ConflictException when name update would not create a duplicate class', async () => {
      // Arrange: Define update data and configure mocks
      const updateData: IUpdateClassDTO = {
        name: 'Physics 202', // Nome diferente do existingClass
      };

      const existingClass = {
        ...mockClass,
        id: 'different-id',
        name: 'Physics 101', // Nome diferente do updateData
      };

      // Mock repository to return the existing class
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);

      // Use mockImplementation para simular o comportamento real
      // Isso retornará existingClass apenas se o nome for 'Physics 101'
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockImplementation(
        (name) => {
          if (name === 'Physics 101') {
            return Promise.resolve(existingClass);
          }
          return Promise.resolve(null);
        },
      );

      // Mock para o update retornar classe atualizada
      const updatedClass = {
        ...mockClass,
        ...updateData,
        updatedAt: new Date(),
      };
      (repository.update as jest.Mock).mockResolvedValue(updatedClass);

      // Act: Execute the method to be tested
      const result = await useCase.execute(mockClassId, updateData, mockTeacherId);

      // Assert: Verify expected behavior
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        updateData.name,
        mockClass.period,
        mockClass.teacherId,
        mockClass.section,
      );
      // Verify update was called (porque não deve lançar exceção)
      expect(repository.update).toHaveBeenCalledWith(mockClassId, updateData);
      expect(result).toEqual(updatedClass);
    });

    it('should throw ConflictException when section update would create a duplicate class', async () => {
      // Arrange: Configure mocks for duplicate conflict
      const updateData: IUpdateClassDTO = {
        section: 3,
      };

      const existingClass = {
        ...mockClass,
        id: 'different-id',
        section: 3,
      };

      // Mock repository to return the existing class and a conflict
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(existingClass);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(mockClassId, updateData, mockTeacherId)).rejects.toThrow(ConflictException);

      // Verify methods were called with correct parameters
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        mockClass.name,
        mockClass.period,
        mockClass.teacherId,
        updateData.section,
      );

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when period update would create a duplicate class', async () => {
      // Arrange: Configure mocks for duplicate conflict
      const updateData: IUpdateClassDTO = {
        period: '2024.1',
      };

      const existingClass = {
        ...mockClass,
        id: 'different-id',
        period: '2024.1',
      };

      // Mock repository to return the existing class and a conflict
      (repository.findById as jest.Mock).mockResolvedValue(mockClass);
      (repository.findByNamePeriodAndTeacher as jest.Mock).mockResolvedValue(existingClass);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(mockClassId, updateData, mockTeacherId)).rejects.toThrow(ConflictException);

      // Verify methods were called with correct parameters
      expect(repository.findById).toHaveBeenCalledWith(mockClassId);
      expect(repository.findByNamePeriodAndTeacher).toHaveBeenCalledWith(
        mockClass.name,
        updateData.period,
        mockClass.teacherId,
        mockClass.section,
      );

      // Verify update was not called
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
