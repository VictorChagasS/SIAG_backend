import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

export interface IListActiveTeacherClassesParams {
  teacherId: string;
  name?: string;
}

@Injectable()
export class ListActiveTeacherClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute({ teacherId, name }: IListActiveTeacherClassesParams): Promise<Class[]> {
    return this.classRepository.findActiveByTeacherId(teacherId, name);
  }
}
