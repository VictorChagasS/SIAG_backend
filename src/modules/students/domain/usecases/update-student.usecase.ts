/**
 * Update Student Use Case
 *
 * Implements the business logic for updating an existing student.
 * Validates permissions, checks for duplicate registrations, and handles student updates.
 *
 * @module StudentUseCases
 * @students Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

/**
 * Data transfer object for updating a student
 *
 * @interface IUpdateStudentDTO
 * @students DTO
 */
export interface IUpdateStudentDTO {
  /**
   * Updated name for the student
   */
  name?: string;

  /**
   * Updated email address for the student
   */
  email?: string;

  /**
   * Updated registration number for the student
   */
  registration?: string;
}

/**
 * Service for updating an existing student
 *
 * Handles the business logic for student updates, including:
 * - Validation that the student exists
 * - Validation that the class exists
 * - Permission checking (only class owner can update its students)
 * - Ensuring no duplicate registration numbers within a class
 *
 * @class UpdateStudentUseCase
 * @students UseCase
 */
@Injectable()
export class UpdateStudentUseCase {
  /**
   * Creates an UpdateStudentUseCase instance with required repositories
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
   * Updates an existing student if the teacher has permission
   *
   * @param {string} id - The ID of the student to update
   * @param {IUpdateStudentDTO} data - The data to update on the student
   * @param {string} teacherId - ID of the teacher requesting the update
   * @returns {Promise<Student>} The updated student
   * @throws {NotFoundException} If the student or class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @throws {ConflictException} If another student with the same registration exists in the class
   * @students Execute
   */
  async execute(id: string, data: IUpdateStudentDTO, teacherId: string): Promise<Student> {
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
        'Você não tem permissão para atualizar estudantes desta turma',
      );
    }

    // Se estiver atualizando a matrícula, verificar se já existe outro estudante com a mesma matrícula na turma
    if (data.registration && data.registration !== student.registration) {
      const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
        data.registration,
        student.classId,
      );

      if (existingStudent && existingStudent.id !== id) {
        throw new ConflictException(
          'Já existe um estudante com esta matrícula nesta turma',
        );
      }
    }

    return this.studentRepository.update(id, data);
  }
}
