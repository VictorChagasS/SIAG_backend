import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

@Injectable()
export class GetUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, teacherId: string): Promise<Unit> {
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
        'Você não tem permissão para visualizar esta unidade',
      );
    }

    return unit;
  }
}
