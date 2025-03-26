/**
 * Create Grade Use Case
 *
 * Implements the business logic for creating a new grade for a student on a specific evaluation item.
 * Validates permissions, student and evaluation item existence, and prevents duplicate grades.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, NotFoundException, ConflictException, ForbiddenException,
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
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Data transfer object for creating a grade
 *
 * @interface ICreateGradeRequest
 * @grades DTO
 */
interface ICreateGradeRequest {
  /**
   * ID of the student receiving the grade
   */
  studentId: string;

  /**
   * ID of the evaluation item the grade belongs to
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

  /**
   * ID of the teacher creating the grade
   * Used for permission validation
   */
  teacherId: string;
}

/**
 * Service for creating a new grade
 *
 * Handles the business logic for grade creation, including:
 * - Validation that the evaluation item exists
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can create grades)
 * - Validation that the student exists and belongs to the class
 * - Ensuring no duplicate grades for the same student and evaluation item
 *
 * @class CreateGradeUseCase
 * @grades UseCase
 */
@Injectable()
export class CreateGradeUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IEvaluationItemRepository} evaluationItemRepository - Repository for evaluation item data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @grades Constructor
   */
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Creates a new grade for a student on an evaluation item
   *
   * @param {ICreateGradeRequest} request - The data needed to create a grade
   * @returns {Promise<Grade>} The newly created grade
   * @throws {NotFoundException} If the evaluation item, unit, class, or student is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class or the student doesn't belong to the class
   * @throws {ConflictException} If a grade already exists for this student and evaluation item
   * @grades Execute
   */
  async execute({
    studentId,
    evaluationItemId,
    value,
    comments,
    teacherId,
  }: ICreateGradeRequest): Promise<Grade> {
    // Verificar se o item avaliativo existe
    const evaluationItem = await this.evaluationItemRepository.findById(evaluationItemId);
    if (!evaluationItem) {
      throw new NotFoundException('Item avaliativo não encontrado');
    }

    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(evaluationItem.unitId);
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
        'Você não tem permissão para criar notas nesta turma',
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
        'Este estudante não pertence à turma do item avaliativo',
      );
    }

    // Verificar se já existe uma nota para este estudante e item avaliativo
    const existingGrade = await this.gradeRepository.findByStudentAndEvaluationItem(
      studentId,
      evaluationItemId,
    );

    if (existingGrade) {
      throw new ConflictException(
        'Já existe uma nota para este estudante e item avaliativo',
      );
    }

    // Criar a nota
    const grade = await this.gradeRepository.create({
      id: undefined,
      studentId,
      evaluationItemId,
      value,
      comments,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return grade;
  }
}
