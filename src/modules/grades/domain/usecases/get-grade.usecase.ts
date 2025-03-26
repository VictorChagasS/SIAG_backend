/**
 * Get Grade Use Case
 *
 * Implements the business logic for retrieving a specific grade by its ID.
 * Validates permissions and relationships between grade, evaluation item, unit, and class.
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
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GRADE_REPOSITORY } from '../../grades.providers';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../repositories/grade-repository.interface';

/**
 * Service for retrieving a specific grade
 *
 * Handles the business logic for grade retrieval, including:
 * - Validation that the grade exists
 * - Validation that the evaluation item exists
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can view grades)
 *
 * @class GetGradeUseCase
 * @grades UseCase
 */
@Injectable()
export class GetGradeUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IGradeRepository} gradeRepository - Repository for grade data access
   * @param {IEvaluationItemRepository} evaluationItemRepository - Repository for evaluation item data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @grades Constructor
   */
  constructor(
    @Inject(GRADE_REPOSITORY)
    private gradeRepository: IGradeRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Retrieves a grade by its ID if the teacher has permission
   *
   * @param {string} id - The ID of the grade to retrieve
   * @param {string} teacherId - ID of the teacher requesting the grade
   * @returns {Promise<Grade>} The requested grade
   * @throws {NotFoundException} If the grade, evaluation item, unit, or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @grades Execute
   */
  async execute(id: string, teacherId: string): Promise<Grade> {
    // Verificar se a nota existe
    const grade = await this.gradeRepository.findById(id);
    if (!grade) {
      throw new NotFoundException('Nota não encontrada');
    }

    // Verificar se o item avaliativo existe
    const evaluationItem = await this.evaluationItemRepository.findById(grade.evaluationItemId);
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
        'Você não tem permissão para visualizar notas nesta turma',
      );
    }

    return grade;
  }
}
