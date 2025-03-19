/**
 * Testes unitários para CalculateStudentAverageUseCase
 *
 * Este arquivo contém testes para validar os cenários de sucesso e exceções
 * relacionados ao cálculo de média individual de um estudante.
 */
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { CalculateStudentAverageUseCase } from '@/modules/grades/domain/usecases/calculate-student-average.usecase';
import { GRADE_REPOSITORY } from '@/modules/grades/grades.providers';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

describe('CalculateStudentAverageUseCase', () => {
  let useCase: CalculateStudentAverageUseCase;
  let mockGradeRepository: any;
  let mockUnitRepository: any;
  let mockClassRepository: any;
  let mockStudentRepository: any;
  let mockEvaluationItemRepository: any;

  // Dados de exemplo para utilização nos testes
  const mockTeacherId = 'teacher-123';
  const mockStudentId = 'student-123';
  const mockClassId = 'class-123';

  // Estudante de exemplo
  const mockStudent = {
    id: mockStudentId,
    name: 'João da Silva',
    registration: '2021001',
    classId: mockClassId,
  };

  // Classe de exemplo
  const mockClass = {
    id: mockClassId,
    name: 'Matemática 101',
    teacherId: mockTeacherId,
    typeFormula: 'simple',
    averageFormula: null,
  };

  // Unidades de exemplo
  const mockUnits = [
    {
      id: 'unit-1',
      name: 'Unidade 1',
      classId: mockClassId,
      typeFormula: 'simple',
      averageFormula: null,
    },
    {
      id: 'unit-2',
      name: 'Unidade 2',
      classId: mockClassId,
      typeFormula: 'simple',
      averageFormula: null,
    },
  ];

  // Itens de avaliação de exemplo
  const mockEvaluationItems = [
    // Itens da Unidade 1
    {
      id: 'eval-1-1',
      name: 'Prova 1',
      unitId: 'unit-1',
      weight: 1,
    },
    {
      id: 'eval-1-2',
      name: 'Trabalho 1',
      unitId: 'unit-1',
      weight: 1,
    },
    // Itens da Unidade 2
    {
      id: 'eval-2-1',
      name: 'Prova 2',
      unitId: 'unit-2',
      weight: 1,
    },
    {
      id: 'eval-2-2',
      name: 'Trabalho 2',
      unitId: 'unit-2',
      weight: 1,
    },
  ];

  // Notas de exemplo
  const mockGradesUnit1 = [
    {
      id: 'grade-1-1',
      studentId: mockStudentId,
      evaluationItemId: 'eval-1-1',
      value: 8.0,
    },
    {
      id: 'grade-1-2',
      studentId: mockStudentId,
      evaluationItemId: 'eval-1-2',
      value: 7.0,
    },
  ];

  const mockGradesUnit2 = [
    {
      id: 'grade-2-1',
      studentId: mockStudentId,
      evaluationItemId: 'eval-2-1',
      value: 9.0,
    },
    {
      id: 'grade-2-2',
      studentId: mockStudentId,
      evaluationItemId: 'eval-2-2',
      value: 8.0,
    },
  ];

  beforeEach(async () => {
    // Criação dos mocks para os repositórios
    mockGradeRepository = {
      findByStudentAndUnit: jest.fn(),
    };

    mockUnitRepository = {
      findByClassId: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    mockStudentRepository = {
      findById: jest.fn(),
    };

    mockEvaluationItemRepository = {
      findByUnitId: jest.fn(),
    };

    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateStudentAverageUseCase,
        {
          provide: GRADE_REPOSITORY,
          useValue: mockGradeRepository,
        },
        {
          provide: UNIT_REPOSITORY,
          useValue: mockUnitRepository,
        },
        {
          provide: CLASS_REPOSITORY,
          useValue: mockClassRepository,
        },
        {
          provide: STUDENT_REPOSITORY,
          useValue: mockStudentRepository,
        },
        {
          provide: EVALUATION_ITEM_REPOSITORY,
          useValue: mockEvaluationItemRepository,
        },
      ],
    }).compile();

    useCase = module.get<CalculateStudentAverageUseCase>(CalculateStudentAverageUseCase);

    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve calcular corretamente a média de um estudante usando média aritmética simples', async () => {
      // Arrange: Configurar mocks
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(mockStudent);
      mockUnitRepository.findByClassId.mockResolvedValue(mockUnits);

      // Configurar itens de avaliação
      mockEvaluationItemRepository.findByUnitId
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-1'))
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-2'));

      // Configurar notas
      mockGradeRepository.findByStudentAndUnit
        .mockResolvedValueOnce(mockGradesUnit1)
        .mockResolvedValueOnce(mockGradesUnit2);

      // Act: Executar o método a ser testado
      const result = await useCase.execute(mockStudentId, mockClassId, mockTeacherId);

      // Assert: Verificar o comportamento esperado

      // Verificar se os métodos foram chamados com os parâmetros corretos
      expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
      expect(mockStudentRepository.findById).toHaveBeenCalledWith(mockStudentId);
      expect(mockUnitRepository.findByClassId).toHaveBeenCalledWith(mockClassId);

      expect(mockEvaluationItemRepository.findByUnitId).toHaveBeenCalledTimes(2);
      expect(mockEvaluationItemRepository.findByUnitId).toHaveBeenCalledWith('unit-1');
      expect(mockEvaluationItemRepository.findByUnitId).toHaveBeenCalledWith('unit-2');

      expect(mockGradeRepository.findByStudentAndUnit).toHaveBeenCalledTimes(2);
      expect(mockGradeRepository.findByStudentAndUnit).toHaveBeenCalledWith(mockStudentId, 'unit-1');
      expect(mockGradeRepository.findByStudentAndUnit).toHaveBeenCalledWith(mockStudentId, 'unit-2');

      // Verificar o resultado
      expect(result).toEqual({
        studentId: mockStudentId,
        studentName: mockStudent.name,
        average: 8, // Média das médias das unidades: (7.5 + 8.5) / 2 = 8
        unitAverages: [
          {
            unitId: 'unit-1',
            unitName: 'Unidade 1',
            average: 7.5, // Média simples de 8.0 e 7.0
          },
          {
            unitId: 'unit-2',
            unitName: 'Unidade 2',
            average: 8.5, // Média simples de 9.0 e 8.0
          },
        ],
      });
    });

    it('deve calcular corretamente a média de um estudante usando fórmula personalizada na unidade', async () => {
      // Arrange: Configurar unidades com fórmula personalizada
      const unitsWithFormula = [
        {
          ...mockUnits[0],
          typeFormula: 'personalized',
          averageFormula: '(N1 * 0.6) + (N2 * 0.4)', // Prova com peso 0.6 e trabalho com peso 0.4
        },
        mockUnits[1], // Segunda unidade mantém a configuração original
      ];

      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(mockStudent);
      mockUnitRepository.findByClassId.mockResolvedValue(unitsWithFormula);

      // Configurar itens de avaliação
      mockEvaluationItemRepository.findByUnitId
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-1'))
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-2'));

      // Configurar notas
      mockGradeRepository.findByStudentAndUnit
        .mockResolvedValueOnce(mockGradesUnit1)
        .mockResolvedValueOnce(mockGradesUnit2);

      // Act: Executar o método a ser testado
      const result = await useCase.execute(mockStudentId, mockClassId, mockTeacherId);

      // Assert
      expect(result.unitAverages[0].average).toBe(7.6); // (8.0 * 0.6) + (7.0 * 0.4) = 7.6
      expect(result.unitAverages[1].average).toBe(8.5); // Média simples: (9.0 + 8.0) / 2 = 8.5
      expect(result.average).toBe(8.05); // (7.6 + 8.5) / 2 = 8.05
    });

    it('deve calcular corretamente a média de um estudante usando fórmula personalizada na classe', async () => {
      // Arrange: Configurar classe com fórmula personalizada
      const classWithFormula = {
        ...mockClass,
        typeFormula: 'personalized',
        averageFormula: '(N1 * 0.3) + (N2 * 0.7)', // Unidade 1 com peso 0.3 e Unidade 2 com peso 0.7
      };

      mockClassRepository.findById.mockResolvedValue(classWithFormula);
      mockStudentRepository.findById.mockResolvedValue(mockStudent);
      mockUnitRepository.findByClassId.mockResolvedValue(mockUnits);

      // Configurar itens de avaliação
      mockEvaluationItemRepository.findByUnitId
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-1'))
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-2'));

      // Configurar notas
      mockGradeRepository.findByStudentAndUnit
        .mockResolvedValueOnce(mockGradesUnit1)
        .mockResolvedValueOnce(mockGradesUnit2);

      // Act: Executar o método a ser testado
      const result = await useCase.execute(mockStudentId, mockClassId, mockTeacherId);

      // Assert
      expect(result.unitAverages[0].average).toBe(7.5); // Média simples: (8.0 + 7.0) / 2 = 7.5
      expect(result.unitAverages[1].average).toBe(8.5); // Média simples: (9.0 + 8.0) / 2 = 8.5
      expect(result.average).toBe(8.2); // (7.5 * 0.3) + (8.5 * 0.7) = 8.2
    });

    it('deve retornar média zero quando não há unidades', async () => {
      // Arrange: Configurar mock para retornar turma e estudante, mas sem unidades
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(mockStudent);
      mockUnitRepository.findByClassId.mockResolvedValue([]);

      // Act: Executar o método a ser testado
      const result = await useCase.execute(mockStudentId, mockClassId, mockTeacherId);

      // Assert
      expect(result).toEqual({
        studentId: mockStudentId,
        studentName: mockStudent.name,
        average: 0,
        unitAverages: [],
      });
    });

    it('deve lançar NotFoundException quando a turma não existe', async () => {
      // Arrange: Configurar mock para retornar null (turma não encontrada)
      mockClassRepository.findById.mockResolvedValue(null);

      // Act & Assert: Executar e verificar que a exceção é lançada
      await expect(useCase.execute(mockStudentId, 'class-inexistente', mockTeacherId))
        .rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando o estudante não existe', async () => {
      // Arrange: Configurar mocks
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(null);

      // Act & Assert: Executar e verificar que a exceção é lançada
      await expect(useCase.execute('student-inexistente', mockClassId, mockTeacherId))
        .rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando o professor não é o dono da turma', async () => {
      // Arrange: Configurar mock para retornar uma turma com outro professor
      const otherTeacherClass = {
        ...mockClass,
        teacherId: 'outro-professor-456',
      };
      mockClassRepository.findById.mockResolvedValue(otherTeacherClass);

      // Act & Assert: Executar e verificar que a exceção é lançada
      await expect(useCase.execute(mockStudentId, mockClassId, mockTeacherId))
        .rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException quando o estudante não pertence à turma', async () => {
      // Arrange: Configurar mock para retornar um estudante de outra turma
      const studentFromOtherClass = {
        ...mockStudent,
        classId: 'other-class-456',
      };
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(studentFromOtherClass);

      // Act & Assert: Executar e verificar que a exceção é lançada
      await expect(useCase.execute(mockStudentId, mockClassId, mockTeacherId))
        .rejects.toThrow(ForbiddenException);
    });

    it('deve calcular corretamente a média quando há notas ausentes', async () => {
      // Arrange: Configurar dados com algumas notas faltando
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findById.mockResolvedValue(mockStudent);
      mockUnitRepository.findByClassId.mockResolvedValue(mockUnits);

      // Configurar itens de avaliação
      mockEvaluationItemRepository.findByUnitId
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-1'))
        .mockResolvedValueOnce(mockEvaluationItems.filter((item) => item.unitId === 'unit-2'));

      // Configurar apenas uma nota na unidade 1 (uma nota faltando)
      mockGradeRepository.findByStudentAndUnit
        .mockResolvedValueOnce([mockGradesUnit1[0]]) // Apenas a primeira nota da unidade 1
        .mockResolvedValueOnce(mockGradesUnit2); // Todas as notas da unidade 2

      // Act: Executar o método a ser testado
      const result = await useCase.execute(mockStudentId, mockClassId, mockTeacherId);

      // Assert
      expect(result.unitAverages[0].average).toBe(8); // Apenas a nota 8.0 (falta a segunda)
      expect(result.unitAverages[1].average).toBe(8.5); // (9.0 + 8.0) / 2 = 8.5
      expect(result.average).toBe(8.25); // (8.0 + 8.5) / 2 = 8.25
    });
  });
});
