import {
  Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';

import { validatePersonalizedFormula } from '@/common/utils/formula-validators';
import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

/**
 * Data Transfer Object for updating a unit's formula
 *
 * @interface IUpdateUnitFormulaDTO
 */
export interface IUpdateUnitFormulaDTO {
  formula?: string;
  typeFormula?: ITypeFormula;
}

/**
 * Use case for updating a unit's formula
 *
 * @class UpdateUnitFormulaUseCase
 ***
 * Use case for updating a unit's formula
 *
 * @class UpdateUnitFormulaUseCase
 */
@Injectable()
export class UpdateUnitFormulaUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
  ) {}

  async execute(id: string, data: IUpdateUnitFormulaDTO, teacherId: string): Promise<Unit> {
    // validate if unit exists
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // validate if class exists
    const classExists = await this.classRepository.findById(unit.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // validate if teacher is the owner of the class
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta unidade',
      );
    }

    const formula = data.formula || '';

    // determine the formula type based on the input or use the provided value
    const typeFormula = data.typeFormula || (formula && formula.trim() !== '' ? 'personalized' : 'simple');

    if (typeFormula === 'personalized') {
      // validate if the formula was provided
      if (!formula || formula.trim() === '') {
        throw new BadRequestException('Para fórmulas personalizadas, é necessário fornecer a fórmula.');
      }

      // search for the evaluations of the unit to validate the formula
      const evaluations = await this.evaluationItemRepository.findByUnitId(id);

      if (evaluations.length === 0) {
        throw new BadRequestException('Não é possível definir uma fórmula personalizada sem avaliações. Crie pelo menos uma avaliação primeiro.');
      }

      // validate if the formula respects the number of evaluations and is a valid mathematical expression
      validatePersonalizedFormula(formula, evaluations.length);
    }

    // update the calculation formula and the formula type
    return this.unitRepository.update(id, {
      averageFormula: formula,
      typeFormula,
    });
  }
}
