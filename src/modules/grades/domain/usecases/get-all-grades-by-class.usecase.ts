/**
 * Get All Grades By Class Use Case
 *
 * Implements the business logic for retrieving all grades for students in a specific class.
 * Aggregates grade data with student, evaluation item, and unit information.
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
 * Grade detail result with associated student, evaluation item, and unit information
 *
 * Contains comprehensive information about each grade, enriched with related entity data
 * for easier consumption by the client
 *
 * @interface IGradeDetailResult
 * @grades DTO
 */
interface IGradeDetailResult {
  /**
   * Unique identifier of the grade
   */
  id: string;

  /**
   * Numeric value of the grade
   */
  value: number;

  /**
   * Unique identifier of the student who received the grade
   */
  studentId: string;

  /**
   * Display name of the student
   */
  studentName: string;

  /**
   * Unique identifier of the evaluation item
   */
  evaluationItemId: string;

  /**
   * Display name of the evaluation item
   */
  evaluationItemName: string;

  /**
   * Unique identifier of the unit the evaluation item belongs to
   */
  unitId: string;

  /**
   * Display name of the unit
   */
  unitName: string;
}

/**
 * Class grades result containing class information and all grades
 *
 * Provides a structured container for all grade details within a class
 *
 * @interface IClassGradesResult
 * @grades DTO
 */
interface IClassGradesResult {
  /**
   * Unique identifier of the class
   */
  classId: string;

  /**
   * Display name of the class
   */
  className: string;

  /**
   * Collection of all grade details in the class
   */
  grades: IGradeDetailResult[];
}

/**
 * Service for retrieving all grades for students in a class
 *
 * Handles the business logic for comprehensive grade retrieval, including:
 * - Permission validation
 * - Aggregating data from multiple repositories
 * - Enriching grade data with student, evaluation item, and unit information
 *
 * @class GetAllGradesByClassUseCase
 * @grades UseCase
 */
@Injectable()
export class GetAllGradesByClassUseCase {
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
   * Retrieves all grades for a class with rich contextual information
   *
   * @param {string} classId - ID of the class to retrieve grades for
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @returns {Promise<IClassGradesResult>} Comprehensive class grades information
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @grades Execute
   */
  async execute(classId: string, teacherId: string): Promise<IClassGradesResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar as notas desta turma',
      );
    }

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    if (students.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todos os itens avaliativos das unidades
    const evaluationItems = await Promise.all(
      units.map(async (unit) => {
        const items = await this.evaluationItemRepository.findByUnitId(unit.id);
        return items;
      }),
    );

    // Achatar o array de arrays
    const flattenedEvaluationItems = evaluationItems.flat();

    if (flattenedEvaluationItems.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Buscar todas as notas dos estudantes para os itens avaliativos
    const grades = await Promise.all(
      students.map(async (student) => {
        // Para cada estudante, buscar as notas de todas as unidades
        const studentGrades = await Promise.all(
          units.map(async (unit) => {
            const gradesForUnit = await this.gradeRepository.findByStudentAndUnit(student.id, unit.id);
            return gradesForUnit;
          }),
        );

        // Achatar o array de arrays
        return studentGrades.flat();
      }),
    );

    // Achatar o array de arrays novamente
    const flattenedGrades = grades.flat();

    if (flattenedGrades.length === 0) {
      return {
        classId,
        className: classEntity.name,
        grades: [],
      };
    }

    // Mapear as notas para o formato de resposta detalhado
    const gradeDetails = flattenedGrades.map((grade) => {
      const evaluationItem = flattenedEvaluationItems.find((item) => item.id === grade.evaluationItemId);
      const unit = evaluationItem ? units.find((u) => u.id === evaluationItem.unitId) : null;
      const student = students.find((s) => s.id === grade.studentId);

      return {
        id: grade.id,
        value: grade.value,
        studentId: grade.studentId,
        studentName: student ? student.name : 'Estudante Desconhecido',
        evaluationItemId: grade.evaluationItemId,
        evaluationItemName: evaluationItem ? evaluationItem.name : 'Item Avaliativo Desconhecido',
        unitId: evaluationItem ? evaluationItem.unitId : 'Unidade Desconhecida',
        unitName: unit ? unit.name : 'Unidade Desconhecida',
      };
    });

    return {
      classId,
      className: classEntity.name,
      grades: gradeDetails,
    };
  }
}
