/**
 * Get Grades by Unit Use Case
 *
 * Implements the business logic for retrieving all grades for a specific unit.
 * Validates permissions and relationships between unit and class.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Service for retrieving all grades for a specific unit
 *
 * Handles the business logic for unit grades retrieval, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can view grades)
 *
 * @class GetGradesByUnitUseCase
 * @grades UseCase
 */
@Injectable()
export class GetGradesByUnitUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @grades Constructor
   */
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Retrieves all grades for a unit if the teacher has permission
   *
   * @param {string} unitId - The ID of the unit to retrieve grades for
   * @param {string} teacherId - ID of the teacher requesting the grades
   * @returns {Promise<Grade[]>} Array of grades for the specified unit
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @grades Execute
   */
  async execute(unitId: string, teacherId: string): Promise<Grade[]> {
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

    // Buscar todas as notas da unidade
    const grades = await this.gradeRepository.findByUnit(unitId);

    return grades;
  }
}
