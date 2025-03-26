/**
 * List Teacher Classes Use Case
 *
 * This use case retrieves all classes taught by a specific teacher,
 * with support for pagination and filtering by name and period.
 *
 * @module ClassUseCases
 */
import { Inject, Injectable } from '@nestjs/common';

import { IPaginatedResponse, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Parameters for listing classes by teacher with pagination and filtering
 *
 * Extends the standard pagination interface with name and period filters
 * and adds the teacher ID parameter.
 *
 * @interface IListTeacherClassesParams
 * @extends IPaginationNamePeriodSearchOptions
 */
export interface IListTeacherClassesParams extends IPaginationNamePeriodSearchOptions {
  /** ID of the teacher whose classes to list */
  teacherId: string;
}

/**
 * Use case for listing classes taught by a specific teacher
 *
 * Provides paginated results with optional filtering by name and period.
 *
 * @class ListTeacherClassesUseCase
 */
@Injectable()
export class ListTeacherClassesUseCase {
  /**
   * Creates an instance of ListTeacherClassesUseCase
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the teacher classes listing use case
   *
   * Retrieves classes taught by the specified teacher with pagination and optional filtering.
   *
   * @param {IListTeacherClassesParams} params - Parameters containing teacherId and optional filters
   * @param {string} params.teacherId - ID of the teacher whose classes to list
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of items per page
   * @param {string} [params.name] - Optional filter by class name
   * @param {string} [params.period] - Optional filter by academic period
   * @returns {Promise<IPaginatedResponse<Class>>} Paginated result of classes with metadata
   */
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
