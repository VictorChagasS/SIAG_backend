import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

@Injectable()
export class ListClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute(): Promise<Class[]> {
    return this.classRepository.findAll();
  }
}
