import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '../../classes.providers';
import { Class } from '../entities/class.entity';
import { IClassRepository } from '../repositories/class-repository.interface';

/**
 * Parameters for listing active classes for a specific teacher
 *
 * @interface IListActiveTeacherClassesParams
 * @property {string} teacherId - ID of the teacher whose active classes to list
 * @property {string} [name] - Optional search term to filter classes by name
 */
export interface IListActiveTeacherClassesParams {
  /** ID of the teacher whose active classes to list */
  teacherId: string;
  /** Optional search term to filter classes by name */
  name?: string;
}

/**
 * Use case for listing active classes of a specific teacher
 * Active classes are those from the current period
 *
 * @class ListActiveTeacherClassesUseCase
 */
@Injectable()
export class ListActiveTeacherClassesUseCase {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Executes the use case to list active classes for a teacher
   *
   * Retrieves all active classes (current period) for the specified teacher.
   * If a name filter is provided, only classes matching the name will be returned.
   *
   * @param {IListActiveTeacherClassesParams} params - Parameters containing teacherId and optional name filter
   * @returns {Promise<Class[]>} Array of active class entities for the teacher
   */
  async execute({ teacherId, name }: IListActiveTeacherClassesParams): Promise<Class[]> {
    return this.classRepository.findActiveByTeacherId(teacherId, name);
  }
}
