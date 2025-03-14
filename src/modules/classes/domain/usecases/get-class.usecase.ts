import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

@Injectable()
export class GetClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string): Promise<Class> {
    const classFound = await this.classRepository.findById(id);

    if (!classFound) {
      throw new NotFoundException('Classe não encontrada');
    }

    return classFound;
  }
}
