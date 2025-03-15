import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

@Injectable()
export class UpdateClassFormulaUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, formula: string, teacherId: string): Promise<Class> {
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

    // Atualizar apenas a fórmula de cálculo
    return this.classRepository.update(id, { averageFormula: formula });
  }
}
