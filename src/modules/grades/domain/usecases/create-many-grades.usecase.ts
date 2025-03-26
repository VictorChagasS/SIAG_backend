/**
 * Upsert Student Grades Use Case
 *
 * Implements the business logic for creating or updating multiple grades at once
 * for a student across various evaluation items. Validates permissions and ensures
 * the student exists before performing the operation.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, ForbiddenException, NotFoundException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Structure for a single grade item in a batch operation
 *
 * @interface IGradeItem
 * @grades DTO
 */
interface IGradeItem {
  /**
   * ID of the evaluation item this grade belongs to
   */
  evaluationItemId: string;

  /**
   * Numeric value of the grade
   */
  value: number;

  /**
   * Optional comments about the grade
   */
  comments?: string;
}

/**
 * Data transfer object for upserting multiple grades for a student
 *
 * @interface IUpsertStudentGradesRequest
 * @grades DTO
 */
interface IUpsertStudentGradesRequest {
  /**
   * ID of the student receiving the grades
   */
  studentId: string;

  /**
   * Array of grade items to create or update
   */
  grades: IGradeItem[];

  /**
   * ID of the teacher performing the operation
   * Used for permission validation
   */
  teacherId: string;
}

/**
 * Service for creating or updating multiple grades for a student at once
 *
 * Handles the business logic for batch grade operations, including:
 * - Validation that the student exists
 * - Validation that the class exists
 * - Permission checking (only class owner can create/update grades)
 *
 * @class UpsertStudentGradesUseCase
 * @grades UseCase
 */
@Injectable()
export class UpsertStudentGradesUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @grades Constructor
   */
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Creates or updates multiple grades for a student across various evaluation items
   *
   * @param {IUpsertStudentGradesRequest} request - The data needed to upsert grades
   * @returns {Promise<Grade[]>} The created or updated grades
   * @throws {NotFoundException} If the student or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @grades Execute
   */
  async execute({
    studentId,
    grades,
    teacherId,
  }: IUpsertStudentGradesRequest): Promise<Grade[]> {
    if (grades.length === 0) {
      return [];
    }

    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(student.classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor tem permissão para a turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Você não tem permissão para criar ou atualizar notas nesta turma');
    }

    // Criar ou atualizar as notas
    const gradesToUpsert = grades.map((grade) => ({
      id: undefined,
      studentId,
      evaluationItemId: grade.evaluationItemId,
      value: grade.value,
      comments: grade.comments,
      createdAt: undefined,
      updatedAt: undefined,
    }));

    const upsertedGrades = await this.gradeRepository.upsertMany(gradesToUpsert);

    return upsertedGrades;
  }
}
