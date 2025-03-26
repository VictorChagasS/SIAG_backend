/**
 * Get Student Grades by Unit Use Case
 *
 * Implements the business logic for retrieving all grades for a specific student within a unit.
 * Validates permissions and relationships between student, unit, and class.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Service for retrieving all grades for a specific student within a unit
 *
 * Handles the business logic for student-specific unit grades retrieval, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Validation that the student exists
 * - Validation that the student belongs to the class
 * - Permission checking (only class owner can view grades)
 *
 * @class GetStudentGradesByUnitUseCase
 * @grades UseCase
 */
@Injectable()
export class GetStudentGradesByUnitUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
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
  ) {}

  /**
   * Retrieves all grades for a student within a unit if the teacher has permission
   *
   * @param {string} unitId - The ID of the unit to retrieve grades for
   * @param {string} studentId - The ID of the student to retrieve grades for
   * @param {string} teacherId - ID of the teacher requesting the grades
   * @returns {Promise<Grade[]>} Array of grades for the specified student and unit
   * @throws {NotFoundException} If the unit, class, or student is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class or the student doesn't belong to the class
   * @grades Execute
   */
  async execute(unitId: string, studentId: string, teacherId: string): Promise<Grade[]> {
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
        'Você não tem permissão para visualizar notas nesta turma',
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

    // Buscar todas as notas do estudante na unidade
    const grades = await this.gradeRepository.findByStudentAndUnit(studentId, unitId);

    return grades;
  }
}
