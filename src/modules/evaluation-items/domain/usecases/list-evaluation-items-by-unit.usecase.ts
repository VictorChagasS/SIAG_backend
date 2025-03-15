import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

@Injectable()
export class ListEvaluationItemsByUnitUseCase {
  constructor(
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(unitId: string, teacherId: string): Promise<EvaluationItem[]> {
    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(unitId);
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
        'Você não tem permissão para visualizar os itens avaliativos desta unidade',
      );
    }

    return this.evaluationItemRepository.findByUnitId(unitId);
  }
}
