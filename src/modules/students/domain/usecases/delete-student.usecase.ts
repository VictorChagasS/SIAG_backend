/**
 * Delete Student Use Case
 *
 * Implements the business logic for deleting an existing student.
 * Validates permissions and handles student deletion with cascading effects.
 *
 * @module StudentUseCases
 * @students Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { IStudentRepository } from '../repositories/student-repository.interface';

/**
 * Service for deleting an existing student
 *
 * Handles the business logic for student deletion, including:
 * - Validation that the student exists
 * - Validation that the class exists
 * - Permission checking (only class owner can delete its students)
 * - Cascading deletion of related grades and other student data
 *
 * @class DeleteStudentUseCase
 * @students UseCase
 */
@Injectable()
export class DeleteStudentUseCase {
  /**
   * Creates a DeleteStudentUseCase instance with required repositories
   *
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @students Constructor
   */
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
  ) {}

  /**
   * Deletes a student if the teacher has permission
   *
   * @param {string} id - The ID of the student to delete
   * @param {string} teacherId - ID of the teacher requesting the deletion
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the student or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @students Execute
   */
  async execute(id: string, teacherId: string): Promise<void> {
    // Verificar se o estudante existe
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(student.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir estudantes desta turma',
      );
    }

    await this.studentRepository.delete(id);
  }
}
