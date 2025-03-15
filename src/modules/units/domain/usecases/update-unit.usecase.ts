import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

export interface IUpdateUnitDTO {
  name?: string;
  averageFormula?: string;
}

@Injectable()
export class UpdateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, data: IUpdateUnitDTO, teacherId: string): Promise<Unit> {
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
        'Você não tem permissão para atualizar unidades desta turma',
      );
    }

    // Se estiver atualizando o nome, verificar se já existe outra unidade com o mesmo nome na turma
    if (data.name && data.name !== unit.name) {
      const existingUnit = await this.unitRepository.findByNameAndClassId(
        data.name,
        unit.classId,
      );

      if (existingUnit && existingUnit.id !== id) {
        throw new ConflictException(
          'Já existe uma unidade com este nome nesta turma',
        );
      }
    }

    return this.unitRepository.update(id, data);
  }
}
