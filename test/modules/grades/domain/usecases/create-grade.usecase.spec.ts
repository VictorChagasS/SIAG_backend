/**
 * Testes unitários para CreateGradeUseCase
 *
 * Este arquivo contém testes para validar os cenários de sucesso e exceções
 * relacionados à criação de notas para estudantes.
 */
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { Grade } from '@/modules/grades/domain/entities/grade.entity';
import { CreateGradeUseCase } from '@/modules/grades/domain/usecases/create-grade.usecase';
import { GRADE_REPOSITORY } from '@/modules/grades/grades.providers';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('CreateGradeUseCase', () => {
  let useCase: CreateGradeUseCase;
  let mockGradeRepository: any;
  let mockEvaluationItemRepository: any;
  let mockStudentRepository: any;
  let mockUnitRepository: any;
  let mockClassRepository: any;

  // Dados de exemplo para utilização nos testes
  const mockTeacherId = 'teacher-123';
  const mockStudentId = 'student-123';
  const mockEvaluationItemId = 'eval-item-123';
  const mockUnitId = 'unit-123';
  const mockClassId = 'class-123';

  // Objetos mockados utilizados nos testes
  const mockEvaluationItem = {
    id: mockEvaluationItemId,
    name: 'Prova 1',
    unitId: mockUnitId,
  };

  const mockUnit = {
    id: mockUnitId,
    name: 'Unidade 1',
    classId: mockClassId,
  };

  const mockClass = {
    id: mockClassId,
    name: 'Matemática',
    teacherId: mockTeacherId,
  };

  const mockStudent = {
    id: mockStudentId,
    name: 'João',
    classId: mockClassId,
  };

  const mockGrade: Grade = {
    id: 'grade-123',
    studentId: mockStudentId,
    evaluationItemId: mockEvaluationItemId,
    value: 8.5,
    comments: 'Muito bom',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Criando mocks para todos os repositories
    mockGradeRepository = {
      create: jest.fn(),
      findByStudentAndEvaluationItem: jest.fn(),
    };

    mockEvaluationItemRepository = {
      findById: jest.fn(),
    };

    mockStudentRepository = {
      findById: jest.fn(),
    };

    mockUnitRepository = {
      findById: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Configurando o módulo de teste com os mocks
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGradeUseCase,
        { provide: GRADE_REPOSITORY, useValue: mockGradeRepository },
        { provide: EVALUATION_ITEM_REPOSITORY, useValue: mockEvaluationItemRepository },
        { provide: STUDENT_REPOSITORY, useValue: mockStudentRepository },
        { provide: UNIT_REPOSITORY, useValue: mockUnitRepository },
        { provide: CLASS_REPOSITORY, useValue: mockClassRepository },
      ],
    }).compile();

    useCase = module.get<CreateGradeUseCase>(CreateGradeUseCase);
  });

  // Resetando todos os mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should create a new grade successfully', async () => {
    // Configuring the mock behavior for the happy path
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue(mockClass);
    mockStudentRepository.findById.mockResolvedValue(mockStudent);
    mockGradeRepository.findByStudentAndEvaluationItem.mockResolvedValue(null);
    mockGradeRepository.create.mockResolvedValue(mockGrade);

    // Data for the use case
    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing the use case
    const result = await useCase.execute(request);

    // Verifications
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockStudentRepository.findById).toHaveBeenCalledWith(mockStudentId);
    expect(mockGradeRepository.findByStudentAndEvaluationItem).toHaveBeenCalledWith(
      mockStudentId,
      mockEvaluationItemId,
    );
    expect(mockGradeRepository.create).toHaveBeenCalledWith({
      id: undefined,
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      createdAt: undefined,
      updatedAt: undefined,
    });
    expect(result).toEqual(mockGrade);
  });

  it('Should throw NotFoundException when the evaluation item does not exist', async () => {
    // Evaluation item not found
    mockEvaluationItemRepository.findById.mockResolvedValue(null);

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
  });

  it('Should throw NotFoundException when the unit does not exist', async () => {
    // Evaluation item exists but unit does not
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(null);

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
  });

  it('Should throw NotFoundException when the class does not exist', async () => {
    // Evaluation item and unit exist but class does not
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue(null);

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
  });

  it('Should throw ForbiddenException when the teacher is not the owner of the class', async () => {
    // Everything exists but the teacher is not the owner of the class
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue({
      ...mockClass,
      teacherId: 'outro-professor',
    });

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(ForbiddenException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
  });

  it('Should throw NotFoundException when the student does not exist', async () => {
    // Professor is the owner of the class but the student does not exist
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue(mockClass);
    mockStudentRepository.findById.mockResolvedValue(null);

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockStudentRepository.findById).toHaveBeenCalledWith(mockStudentId);
  });

  it('Should throw ForbiddenException when the student does not belong to the class', async () => {
    // Student exists but does not belong to the class
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue(mockClass);
    mockStudentRepository.findById.mockResolvedValue({
      ...mockStudent,
      classId: 'outra-turma',
    });

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(ForbiddenException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockStudentRepository.findById).toHaveBeenCalledWith(mockStudentId);
  });

  it('Should throw ConflictException when a grade already exists for this student and evaluation item', async () => {
    // Everything is correct but a grade already exists
    mockEvaluationItemRepository.findById.mockResolvedValue(mockEvaluationItem);
    mockUnitRepository.findById.mockResolvedValue(mockUnit);
    mockClassRepository.findById.mockResolvedValue(mockClass);
    mockStudentRepository.findById.mockResolvedValue(mockStudent);
    mockGradeRepository.findByStudentAndEvaluationItem.mockResolvedValue(mockGrade);

    const request = {
      studentId: mockStudentId,
      evaluationItemId: mockEvaluationItemId,
      value: 8.5,
      comments: 'Muito bom',
      teacherId: mockTeacherId,
    };

    // Executing and verifying the exception
    await expect(useCase.execute(request)).rejects.toThrow(ConflictException);
    expect(mockEvaluationItemRepository.findById).toHaveBeenCalledWith(mockEvaluationItemId);
    expect(mockUnitRepository.findById).toHaveBeenCalledWith(mockUnitId);
    expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
    expect(mockStudentRepository.findById).toHaveBeenCalledWith(mockStudentId);
    expect(mockGradeRepository.findByStudentAndEvaluationItem).toHaveBeenCalledWith(
      mockStudentId,
      mockEvaluationItemId,
    );
  });
});
