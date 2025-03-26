import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

export interface IUpsertUnitDTO {
  name: string;
  classId: string;
  averageFormula?: string;
  teacherId: string; // ID do professor que está criando/atualizando a unidade
  createdAt?: Date; // Data de criação personalizada para a unidade
}

@Injectable()
export class UpsertUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(data: IUpsertUnitDTO): Promise<Unit> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(data.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== data.teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para gerenciar unidades desta turma',
      );
    }

    // Verificar se já existe uma unidade com o mesmo nome na turma
    const existingUnit = await this.unitRepository.findByNameAndClassId(
      data.name,
      data.classId,
    );

    // Se a unidade já existe, atualiza
    if (existingUnit) {
      return this.unitRepository.update(existingUnit.id, {
        averageFormula: data.averageFormula,
      });
    }

    // Se não existe, cria uma nova
    const newUnit = new Unit({
      name: data.name,
      classId: data.classId,
      averageFormula: data.averageFormula,
      createdAt: data.createdAt,
    });

    return this.unitRepository.create(newUnit);
  }
}
