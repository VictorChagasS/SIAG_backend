import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { IClassRepository } from '../repositories/class-repository.interface';

@Injectable()
export class DeleteClassUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const classExists = await this.classRepository.findById(id);

    if (!classExists) {
      throw new NotFoundException('Classe não encontrada');
    }

    await this.classRepository.delete(id);
  }
} 