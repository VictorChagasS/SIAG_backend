/**
 * Create Unit Use Case
 *
 * Implements the business logic for creating a new unit within a class.
 * Validates permissions, checks for duplicate names, and handles unit creation.
 *
 * @module UnitUseCases
 * @units Domain
 */
import {
  Inject, Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

/**
 * Data transfer object for creating a unit
 *
 * @interface ICreateUnitDTO
 * @units DTO
 */
export interface ICreateUnitDTO {
  /**
   * Name of the unit (e.g., "First Bimester", "Unit 1")
   */
  name: string;

  /**
   * ID of the class this unit belongs to
   */
  classId: string;

  /**
   * Optional custom formula for calculating the unit average
   */
  averageFormula?: string;

  /**
   * ID of the teacher creating the unit
   * Used for permission validation
   */
  teacherId: string;

  /**
   * Optional custom creation date for the unit
   * If provided, this date will be used instead of the current date
   */
  createdAt?: Date;
}

/**
 * Service for creating a new unit
 *
 * Handles the business logic for unit creation, including:
 * - Validation that the class exists
 * - Permission checking (only class owner can create units)
 * - Ensuring no duplicate unit names within a class
 *
 * @class CreateUnitUseCase
 * @units UseCase
 */
@Injectable()
export class CreateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Creates a new unit for a class
   *
   * @param {ICreateUnitDTO} data - Data required to create a unit
   * @returns {Promise<Unit>} The newly created unit
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @throws {ConflictException} If a unit with the same name already exists in the class
   * @units Execute
   */
  async execute(data: ICreateUnitDTO): Promise<Unit> {
    // Verificar se a turma existe
    console.log('data.classId', data);
    const classExists = await this.classRepository.findById(data.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== data.teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para adicionar unidades a esta turma',
      );
    }

    // Verificar se já existe uma unidade com o mesmo nome na turma
    const existingUnit = await this.unitRepository.findByNameAndClassId(
      data.name,
      data.classId,
    );

    if (existingUnit) {
      throw new ConflictException(
        'Já existe uma unidade com este nome nesta turma',
      );
    }

    const newUnit = new Unit({
      name: data.name,
      classId: data.classId,
      averageFormula: data.averageFormula,
      createdAt: data.createdAt,
    });

    return this.unitRepository.create(newUnit);
  }
}
