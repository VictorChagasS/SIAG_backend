import { Inject, Injectable } from '@nestjs/common';

import { IPaginatedResponse, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

export interface IListTeacherClassesParams extends IPaginationNamePeriodSearchOptions {
  teacherId: string;
}

@Injectable()
export class ListTeacherClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  async execute({
    teacherId,
    page = 1,
    limit = 10,
    name,
    period,
  }: IListTeacherClassesParams): Promise<IPaginatedResponse<Class>> {
    const options: IPaginationNamePeriodSearchOptions = {
      page,
      limit,
      name,
      period,
    };

    const { data, total } = await this.classRepository.findByTeacherId(
      teacherId,
      options,
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
