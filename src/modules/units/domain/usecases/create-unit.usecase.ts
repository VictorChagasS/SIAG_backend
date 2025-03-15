import {
  Inject, Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { UNIT_REPOSITORY } from '../../units.providers';
import { Unit } from '../entities/unit.entity';
import { IUnitRepository } from '../repositories/unit-repository.interface';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

export interface ICreateUnitDTO {
  name: string;
  classId: string;
  averageFormula?: string;
  teacherId: string; // ID do professor que está criando a unidade
}

@Injectable()
export class CreateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(data: ICreateUnitDTO): Promise<Unit> {
    // Verificar se a turma existe
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
    });

    return this.unitRepository.create(newUnit);
  }
}
