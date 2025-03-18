/**
 * Update Class Formula Use Case
 *
 * This use case handles the updating of a class's grade calculation formula
 * with validation to ensure the formula is valid and the user is authorized.
 *
 * @module ClassUseCases
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';

import { validatePersonalizedFormula } from '@/common/utils/formula-validators';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class, ITypeFormula } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Parameters for updating a class's grade calculation formula
 *
 * Contains fields for setting or changing the formula type and expression.
 *
 * @interface IUpdateClassFormulaDTO
 */
export interface IUpdateClassFormulaDTO {
  /** Formula expression (required when typeFormula is 'personalized') */
  formula?: string;

  /** Type of formula to use (simple or personalized) */
  typeFormula: ITypeFormula;
}

/**
 * Use case for updating a class's grade calculation formula
 *
 * Handles the business logic for updating a class's grade calculation formula,
 * including authorization checks and formula validation.
 *
 * @class UpdateClassFormulaUseCase
 */
@Injectable()
export class UpdateClassFormulaUseCase {
  /**
   * Creates an instance of UpdateClassFormulaUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access (needed for formula validation)
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
  ) {}

  /**
   * Executes the update class formula use case
   *
   * Updates a class's grade calculation formula after performing validation
   * and authorization checks to ensure the operation is valid.
   *
   * @param {string} id - ID of the class to update
   * @param {IUpdateClassFormulaDTO} data - New formula data to update the class with
   * @param {string} teacherId - ID of the teacher making the request (for authorization)
   * @returns {Promise<Class>} The updated class entity
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher is not authorized to update this class
   * @throws {BadRequestException} If the formula is invalid or missing required units
   */
  async execute(id: string, data: IUpdateClassFormulaDTO, teacherId: string): Promise<Class> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(id);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta turma',
      );
    }

    // Buscar as unidades da turma (necessário para ambos os tipos de fórmula)
    const units = await this.unitRepository.findByClassId(id);

    if (units.length === 0) {
      throw new BadRequestException('Não é possível definir uma fórmula sem unidades. Crie pelo menos uma unidade primeiro.');
    }

    const formula = data.formula || '';
    const { typeFormula } = data;

    if (typeFormula === 'personalized') {
      // Validar se a fórmula foi fornecida
      if (!formula || formula.trim() === '') {
        throw new BadRequestException('Para fórmulas personalizadas, é necessário fornecer a fórmula.');
      }

      // Validar se a fórmula respeita a quantidade de unidades e é uma expressão matemática válida
      validatePersonalizedFormula(formula, units.length);
    }

    // Atualizar a fórmula de cálculo e o tipo de fórmula
    return this.classRepository.update(id, {
      averageFormula: formula,
      typeFormula,
    });
  }
}
