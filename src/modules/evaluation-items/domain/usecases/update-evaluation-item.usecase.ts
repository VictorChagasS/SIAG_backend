import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

export interface IUpdateEvaluationItemDTO {
  name?: string;
}

@Injectable()
export class UpdateEvaluationItemUseCase {
  constructor(
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, data: IUpdateEvaluationItemDTO, teacherId: string): Promise<EvaluationItem> {
    // Verificar se o item avaliativo existe
    const evaluationItem = await this.evaluationItemRepository.findById(id);
    if (!evaluationItem) {
      throw new NotFoundException('Item avaliativo não encontrado');
    }

    // Verificar se a unidade existe
    const unit = await this.unitRepository.findById(evaluationItem.unitId);
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
        'Você não tem permissão para atualizar itens avaliativos desta unidade',
      );
    }

    // Se estiver atualizando o nome, verificar se já existe outro item avaliativo com o mesmo nome na unidade
    if (data.name && data.name !== evaluationItem.name) {
      const existingEvaluationItem = await this.evaluationItemRepository.findByNameAndUnitId(
        data.name,
        evaluationItem.unitId,
      );

      if (existingEvaluationItem && existingEvaluationItem.id !== id) {
        throw new ConflictException(
          'Já existe um item avaliativo com este nome nesta unidade',
        );
      }
    }

    return this.evaluationItemRepository.update(id, data);
  }
}
