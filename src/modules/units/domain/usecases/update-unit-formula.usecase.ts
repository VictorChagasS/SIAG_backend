import {
  Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { EVALUATION_ITEM_REPOSITORY } from '@/modules/evaluation-items/evaluation-items.providers';
import { validatePersonalizedFormula } from '@/shared/utils/formula-validators';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

export interface IUpdateUnitFormulaDTO {
  formula?: string;
  typeFormula?: ITypeFormula;
}

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
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(unit.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta unidade',
      );
    }

    const formula = data.formula || '';

    // Determinar o tipo de fórmula com base na entrada ou usar o valor fornecido
    const typeFormula = data.typeFormula || (formula && formula.trim() !== '' ? 'personalized' : 'simple');

    if (typeFormula === 'personalized') {
      // Validar se a fórmula foi fornecida
      if (!formula || formula.trim() === '') {
        throw new BadRequestException('Para fórmulas personalizadas, é necessário fornecer a fórmula.');
      }

      // Buscar as avaliações da unidade para validar a fórmula
      const evaluations = await this.evaluationItemRepository.findByUnitId(id);

      if (evaluations.length === 0) {
        throw new BadRequestException('Não é possível definir uma fórmula personalizada sem avaliações. Crie pelo menos uma avaliação primeiro.');
      }

      // Validar se a fórmula respeita a quantidade de avaliações e é uma expressão matemática válida
      validatePersonalizedFormula(formula, evaluations.length);
    }

    // Atualizar a fórmula de cálculo e o tipo de fórmula
    return this.unitRepository.update(id, {
      averageFormula: formula,
      typeFormula,
    });
  }
}
