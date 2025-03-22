/**
 * Create Evaluation Item Use Case
 *
 * Implements the business logic for creating a new evaluation item within a unit.
 * Validates permissions, checks for duplicate names, and handles item creation.
 *
 * @module EvaluationItemUseCases
 * @evaluation-items Domain
 */
import {
  Inject, Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

/**
 * Data transfer object for creating an evaluation item
 *
 * @interface ICreateEvaluationItemDTO
 * @evaluation-items DTO
 */
export interface ICreateEvaluationItemDTO {
  /**
   * Name of the evaluation item (e.g., "Test 1", "Final Project")
   */
  name: string;

  /**
   * ID of the unit this evaluation item belongs to
   */
  unitId: string;

  /**
   * ID of the teacher creating the evaluation item
   * Used for permission validation
   */
  teacherId: string;

  /**
   * Date of creation of the evaluation item
   */
  createdAt?: Date;
}

/**
 * Service for creating a new evaluation item
 *
 * Handles the business logic for evaluation item creation, including:
 * - Validation that the unit exists
 * - Validation that the class exists
 * - Permission checking (only class owner can create items)
 * - Ensuring no duplicate names within the same unit
 *
 * @class CreateEvaluationItemUseCase
 * @evaluation-items UseCase
 */
@Injectable()
export class CreateEvaluationItemUseCase {
  /**
   * Creates a use case instance with the required repositories
   *
   * @param {IEvaluationItemRepository} evaluationItemRepository - Repository for evaluation item data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @evaluation-items Constructor
   */
  constructor(
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the creation of a new evaluation item
   *
   * @param {ICreateEvaluationItemDTO} data - Data needed to create an evaluation item
   * @returns {Promise<EvaluationItem>} The newly created evaluation item
   * @throws {NotFoundException} If the unit or class is not found
   * @throws {ForbiddenException} If the teacher is not the owner of the class
   * @throws {ConflictException} If an evaluation item with the same name already exists in the unit
   * @evaluation-items Execute
   */
  async execute(data: ICreateEvaluationItemDTO): Promise<EvaluationItem> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(data.unitId);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(unit.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== data.teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para adicionar itens avaliativos a esta unidade',
      );
    }

    // Verificar se já existe um item avaliativo com o mesmo nome na unidade
    const existingEvaluationItem = await this.evaluationItemRepository.findByNameAndUnitId(
      data.name,
      data.unitId,
    );

    if (existingEvaluationItem) {
      throw new ConflictException(
        'Já existe um item avaliativo com este nome nesta unidade',
      );
    }

    const newEvaluationItem = new EvaluationItem({
      name: data.name,
      unitId: data.unitId,
      createdAt: data.createdAt,
    });

    return this.evaluationItemRepository.create(newEvaluationItem);
  }
}
