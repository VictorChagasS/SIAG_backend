/**
 * Get Student Use Case
 *
 * Implements the business logic for retrieving a student by its ID.
 *
 * @module StudentUseCases
 * @students Domain
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

/**
 * Service for retrieving a specific student
 *
 * Handles the business logic for student retrieval, including:
 * - Validation that the student exists
 *
 * @class GetStudentUseCase
 * @students UseCase
 */
@Injectable()
export class GetStudentUseCase {
  /**
   * Creates a GetStudentUseCase instance with required repositories
   *
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @students Constructor
   */
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
  ) {}

  /**
   * Retrieves a student by its ID
   *
   * @param {string} id - The ID of the student to retrieve
   * @returns {Promise<Student>} The requested student
   * @throws {NotFoundException} If the student is not found
   * @students Execute
   */
  async execute(id: string): Promise<Student> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    return student;
  }
}
