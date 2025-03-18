import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateStudentAverageUseCase } from '@/modules/grades/domain/usecases/calculate-student-average.usecase';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { IStudentRepository, IStudentSearchOptions } from '../repositories/student-repository.interface';
import { IStudentWithAverage } from '../types/student.types';

/**
 * Parameters for listing students by class with optional search
 *
 * @interface IListStudentsByClassParams
 * @property {string} classId - ID of the class to list students from
 * @property {string} teacherId - ID of the teacher making the request (for authorization)
 * @property {string} [search] - Optional search term to filter students by name or registration
 */
export interface IListStudentsByClassParams {
  /** ID of the class to list students from */
  classId: string;
  /** ID of the teacher making the request (for authorization) */
  teacherId: string;
  /** Optional search term to filter students by name or registration */
  search?: string;
}

/**
 * Use case for listing students belonging to a specific class
 * Includes authorization checks and calculation of student averages
 *
 * @class ListStudentsByClassUseCase
 */
@Injectable()
export class ListStudentsByClassUseCase {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateStudentAverageUseCase: CalculateStudentAverageUseCase,
  ) {}

  /**
   * Executes the use case to list students by class with optional filtering
   *
   * This method performs authorization checks to ensure the teacher has access to the class data.
   * It also calculates and includes the average grade for each student.
   *
   * @param {IListStudentsByClassParams} params - Parameters containing classId, teacherId and optional search term
   * @returns {Promise<IStudentWithAverage[]>} Array of students with their grade averages
   *
   * @throws {NotFoundException} If the class doesn't exist
   * @throws {ForbiddenException} If the teacher is not authorized to view the class
   */
  async execute({
    classId,
    teacherId,
    search,
  }: IListStudentsByClassParams): Promise<IStudentWithAverage[]> {
    // Verify if the class exists
    const classExists = await this.classRepository.findById(classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verify if the teacher owns the class
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para visualizar os estudantes desta turma',
      );
    }

    // Search options
    const options: IStudentSearchOptions = {
      search,
    };

    // Get students
    const students = await this.studentRepository.findByClassId(classId, options);

    // Calculate average for each student
    const studentsWithAverages = await Promise.all(
      students.map(async (student) => {
        const average = await this.calculateStudentAverageUseCase.execute(
          student.id,
          classId,
          teacherId,
        );

        return {
          ...student,
          average: average.average,
        };
      }),
    );

    return studentsWithAverages;
  }
}
