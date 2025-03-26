/**
 * Calculate Unit Average Use Case
 *
 * Implements the business logic for calculating a student's average grade within a specific unit.
 * Supports both simple arithmetic averages and personalized formula calculations.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Unit average calculation result with detailed grade breakdown
 *
 * Contains student and unit information, calculated average, and individual grades
 *
 * @interface IUnitAverageResult
 * @grades DTO
 */
interface IUnitAverageResult {
  studentId: string;
  studentName: string;
  unitId: string;
  unitName: string;
  average: number;
  grades: Array<{
    evaluationItemId: string;
    evaluationItemName: string;
    value: number;
  }>;
}

/**
 * Service for calculating a student's average grade within a specific unit
 *
 * Handles the business logic for unit average calculation, including:
 * - Simple arithmetic averages
 * - Personalized formula-based calculations
 * - Permission validation
 * - Student, unit, and class relationship verification
 *
 * @class CalculateUnitAverageUseCase
 * @grades UseCase
 */
@Injectable()
export class CalculateUnitAverageUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IEvaluationItemRepository} evaluationItemRepository - Repository for evaluation item data access
   * @grades Constructor
   */
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
  ) {}

  /**
   * Calculates a student's average grade within a specific unit
   *
   * @param {string} unitId - ID of the unit to calculate average for
   * @param {string} studentId - ID of the student
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @returns {Promise<IUnitAverageResult>} The calculated unit average result with grade breakdown
   * @throws {NotFoundException} If the unit, class, student, or evaluation items are not found
   * @throws {ForbiddenException} If the teacher doesn't own the class or the student doesn't belong to the class
   * @throws {Error} If there's an error evaluating personalized formulas
   * @grades Execute
   */
  async execute(unitId: string, studentId: string, teacherId: string): Promise<IUnitAverageResult> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(unit.classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para calcular médias nesta turma',
      );
    }

    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se o estudante pertence à turma
    if (student.classId !== classEntity.id) {
      throw new ForbiddenException(
        'Este estudante não pertence à turma da unidade',
      );
    }

    // Buscar todos os itens avaliativos da unidade
    const evaluationItems = await this.evaluationItemRepository.findByUnitId(unitId);
    if (evaluationItems.length === 0) {
      return {
        studentId,
        studentName: student.name,
        unitId,
        unitName: unit.name,
        average: 0,
        grades: [],
      };
    }

    // Buscar todas as notas do estudante na unidade
    const grades = await this.gradeRepository.findByStudentAndUnit(studentId, unitId);

    // Preparar o array de notas para o resultado
    const gradesResult = grades.map((grade) => {
      const evaluationItem = evaluationItems.find((item) => item.id === grade.evaluationItemId);
      return {
        evaluationItemId: grade.evaluationItemId,
        evaluationItemName: evaluationItem ? evaluationItem.name : 'Item Avaliativo Desconhecido',
        value: grade.value,
      };
    });

    // Calcular a média
    let average = 0;

    if (unit.typeFormula === 'simple') {
      // Cálculo de média simples (média aritmética)
      if (grades.length > 0) {
        const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
        average = sum / grades.length;
      }
    } else if (unit.typeFormula === 'personalized' && unit.averageFormula) {
      try {
        // Preparar as variáveis para a fórmula personalizada
        const variables = {};

        // Mapear os itens avaliativos para as variáveis na fórmula
        // Assumindo que os itens avaliativos estão ordenados e correspondem a N1, N2, etc.
        evaluationItems.forEach((item, index) => {
          const grade = grades.find((g) => g.evaluationItemId === item.id);

          // Criar duas variáveis para cada item: uma com o nome original e outra com Nx
          const varName = item.name.replace(/\s+/g, '_').toLowerCase();
          const formulaVarName = `N${index + 1}`;

          const value = grade ? grade.value : 0;
          variables[varName] = value;
          variables[formulaVarName] = value;
        });

        // Avaliar a fórmula personalizada
        // Aqui usamos uma abordagem simples com eval, mas em produção
        // seria melhor usar uma biblioteca de avaliação de expressões matemáticas
        // como math.js ou expr-eval para maior segurança
        const formula = unit.averageFormula;
        let formulaWithValues = formula;

        // Substituir as variáveis pelos valores
        Object.entries(variables).forEach(([name, value]) => {
          const regex = new RegExp(name, 'g');
          formulaWithValues = formulaWithValues.replace(regex, value.toString() || '0');
        });
        // Avaliar a fórmula
        // eslint-disable-next-line no-eval
        average = eval(formulaWithValues);
      } catch (error) {
        throw new Error(`Erro ao calcular a média personalizada: ${error.message} Verifique a fórmula da unidade`);
      }
    }

    // Arredondar para 2 casas decimais
    average = Math.round(average * 100) / 100;

    return {
      studentId,
      studentName: student.name,
      unitId,
      unitName: unit.name,
      average,
      grades: gradesResult,
    };
  }
}
