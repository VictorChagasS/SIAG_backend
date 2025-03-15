import {
  Inject, Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { EVALUATION_ITEM_REPOSITORY } from '../../evaluation-items.providers';
import { EvaluationItem } from '../entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '../repositories/evaluation-item-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

export interface ICreateEvaluationItemDTO {
  name: string;
  unitId: string;
  teacherId: string; // ID do professor que está criando o item avaliativo
}

@Injectable()
export class CreateEvaluationItemUseCase {
  constructor(
    @Inject(EVALUATION_ITEM_REPOSITORY)
    private evaluationItemRepository: IEvaluationItemRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

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
    });

    return this.evaluationItemRepository.create(newEvaluationItem);
  }
}
