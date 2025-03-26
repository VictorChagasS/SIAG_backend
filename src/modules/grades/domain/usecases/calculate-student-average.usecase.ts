/**
 * Calculate Student Average Use Case
 *
 * Implements the business logic for calculating a student's average grades
 * across all units in a class. Supports both simple arithmetic averages and
 * personalized formula calculations.
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
 * Unit average calculation result
 *
 * Contains the unit information and calculated average
 *
 * @interface IUnitAverageResult
 * @grades DTO
 */
interface IUnitAverageResult {
  /**
   * Unique identifier of the unit
   */
  unitId: string;

  /**
   * Display name of the unit
   */
  unitName: string;

  /**
   * Calculated average for the unit (rounded to 2 decimal places)
   */
  average: number;
}

/**
 * Student average calculation result
 *
 * Contains overall student average and individual unit averages
 *
 * @interface IStudentAverageResult
 * @grades DTO
 */
interface IStudentAverageResult {
  /**
   * Unique identifier of the student
   */
  studentId: string;

  /**
   * Display name of the student
   */
  studentName: string;

  /**
   * Overall student average across all units (rounded to 2 decimal places)
   */
  average: number;

  /**
   * Collection of unit-specific averages for this student
   */
  unitAverages: IUnitAverageResult[];
}

/**
 * Service for calculating a student's average grades
 *
 * Handles the business logic for calculating averages, including:
 * - Simple arithmetic averages
 * - Personalized formula-based calculations for both units and classes
 * - Permission validation
 * - Student and class relationship verification
 *
 * @class CalculateStudentAverageUseCase
 * @grades UseCase
 */
@Injectable()
export class CalculateStudentAverageUseCase {
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
   * Calculates a student's average grades across all units in a class
   *
   * @param {string} studentId - ID of the student
   * @param {string} classId - ID of the class
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @returns {Promise<IStudentAverageResult>} The calculated student average result
   * @throws {NotFoundException} If the class, student, or units are not found
   * @throws {ForbiddenException} If the teacher doesn't own the class or the student doesn't belong to the class
   * @throws {Error} If there's an error evaluating personalized formulas
   * @grades Execute
   */
  async execute(studentId: string, classId: string, teacherId: string): Promise<IStudentAverageResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
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
    if (student.classId !== classId) {
      throw new ForbiddenException(
        'Este estudante não pertence à turma',
      );
    }

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        studentId,
        studentName: student.name,
        average: 0,
        unitAverages: [],
      };
    }

    // Calcular a média do estudante em cada unidade
    const unitAverages = await Promise.all(
      units.map(async (unit) => {
        // Buscar todos os itens avaliativos da unidade
        const evaluationItems = await this.evaluationItemRepository.findByUnitId(unit.id);

        // Buscar todas as notas do estudante na unidade
        const grades = await this.gradeRepository.findByStudentAndUnit(studentId, unit.id);

        // Calcular a média do estudante na unidade
        let unitAverage = 0;

        if (unit.typeFormula === 'simple') {
          // Cálculo de média simples (média aritmética)
          if (grades.length > 0) {
            const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
            unitAverage = sum / grades.length;
          }
        } else if (unit.typeFormula === 'personalized' && unit.averageFormula) {
          try {
            // Preparar as variáveis para a fórmula personalizada
            const variables = {};
            evaluationItems.forEach((item, index) => {
              const grade = grades.find((g) => g.evaluationItemId === item.id);
              const value = grade ? grade.value : 0;
              variables[`N${index + 1}`] = value;
            });

            // Avaliar a fórmula personalizada
            const formula = unit.averageFormula;
            let formulaWithValues = formula;

            // Substituir as variáveis pelos valores
            Object.entries(variables).forEach(([name, value]) => {
              const regex = new RegExp(name, 'g');
              formulaWithValues = formulaWithValues.replace(regex, value.toString());
            });

            // Avaliar a fórmula
            // eslint-disable-next-line no-eval
            unitAverage = eval(formulaWithValues);
          } catch (error) {
            throw new Error(`Erro ao calcular a média personalizada para o estudante ${student.name} na unidade ${unit.name}: ${error.message} Verifique a fórmula da unidade`);
          }
        }

        return {
          unitId: unit.id,
          unitName: unit.name,
          average: Math.round(unitAverage * 100) / 100,
        };
      }),
    );

    // Calcular a média geral do estudante usando a fórmula da classe
    let studentAverage = 0;

    if (unitAverages.length > 0) {
      if (classEntity.typeFormula === 'simple') {
        // Média simples das unidades
        const sum = unitAverages.reduce((acc, unit) => acc + unit.average, 0);
        studentAverage = sum / unitAverages.length;
      } else if (classEntity.typeFormula === 'personalized' && classEntity.averageFormula) {
        try {
          // Preparar as variáveis para a fórmula personalizada
          const variables = {};
          unitAverages.forEach((unit, index) => {
            variables[`N${index + 1}`] = unit.average;
            variables[`u${index + 1}`] = unit.average;
          });

          // Avaliar a fórmula personalizada
          const formula = classEntity.averageFormula;
          let formulaWithValues = formula;

          // Substituir as variáveis pelos valores
          Object.entries(variables).forEach(([name, value]) => {
            const regex = new RegExp(name, 'g');
            formulaWithValues = formulaWithValues.replace(regex, value.toString());
          });

          // Avaliar a fórmula
          // eslint-disable-next-line no-eval
          studentAverage = eval(formulaWithValues);
        } catch (error) {
          throw new Error(`Erro ao calcular a média personalizada para o estudante ${student.name}: ${error.message} Verifique a fórmula da classe`);
        }
      }

      // Arredondar para 2 casas decimais
      studentAverage = Math.round(studentAverage * 100) / 100;
    }

    return {
      studentId,
      studentName: student.name,
      average: studentAverage,
      unitAverages,
    };
  }
}
