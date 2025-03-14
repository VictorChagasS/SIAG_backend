import {
  Inject, Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

export interface IUpdateClassDTO {
  name?: string;
  period?: string;
}

@Injectable()
export class UpdateClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string, data: IUpdateClassDTO, teacherId: string): Promise<Class> {
    const classExists = await this.classRepository.findById(id);

    if (!classExists) {
      throw new NotFoundException('Classe não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException('Você não tem permissão para atualizar esta turma');
    }

    // Verificar se estamos atualizando nome ou período
    if (data.name || data.period) {
      // Buscar os valores atuais para os campos que não estão sendo atualizados
      const name = data.name || classExists.name;
      const period = data.period || classExists.period;

      // Verificar se já existe outra turma com a mesma combinação de nome e período para este professor
      const existingClass = await this.classRepository.findByNamePeriodAndTeacher(
        name,
        period,
        teacherId,
      );

      // Se existir uma turma com essa combinação e não for a mesma que estamos atualizando
      if (existingClass && existingClass.id !== id) {
        throw new ConflictException(
          'Você já possui uma turma com este nome neste período',
        );
      }
    }

    return this.classRepository.update(id, data);
  }
}
