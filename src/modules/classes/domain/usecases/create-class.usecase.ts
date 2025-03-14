import { Inject, Injectable, ConflictException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

export interface ICreateClassDTO {
  name: string;
  code: string;
  period: string;
  teacherId: string;
}

@Injectable()
export class CreateClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(data: ICreateClassDTO): Promise<Class> {
    // Verificar se já existe uma turma com o mesmo nome e período para este professor
    const existingClass = await this.classRepository.findByNamePeriodAndTeacher(
      data.name,
      data.period,
      data.teacherId,
    );

    if (existingClass) {
      throw new ConflictException(
        'Você já possui uma turma com este nome neste período',
      );
    }

    const newClass = new Class({
      name: data.name,
      code: data.code,
      period: data.period,
      teacherId: data.teacherId,
    });

    return this.classRepository.create(newClass);
  }
}
