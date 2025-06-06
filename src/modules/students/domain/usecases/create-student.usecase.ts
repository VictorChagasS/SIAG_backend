/**
 * Create Student Use Case
 *
 * Implements the business logic for creating a new student within a class.
 * Validates permissions, checks for duplicate registrations, and handles student creation.
 *
 * @module StudentUseCases
 * @students Domain
 */
import {
  Inject, Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';

import { STUDENT_REPOSITORY } from '../../students.providers';
import { Student } from '../entities/student.entity';
import { IStudentRepository } from '../repositories/student-repository.interface';

/**
 * Data transfer object for creating a student
 *
 * @interface ICreateStudentDTO
 * @students DTO
 */
export interface ICreateStudentDTO {
  /**
   * Full name of the student
   */
  name: string;

  /**
   * Email address of the student (optional)
   */
  email?: string;

  /**
   * Registration number/identifier of the student within the institution
   */
  registration: string;

  /**
   * ID of the class this student belongs to
   */
  classId: string;

  /**
   * ID of the teacher creating the student
   * Used for permission validation
   */
  teacherId: string;
}

/**
 * Service for creating a new student
 *
 * Handles the business logic for student creation, including:
 * - Validation that the class exists
 * - Permission checking (only class owner can create students)
 * - Ensuring no duplicate registration numbers within a class
 *
 * @class CreateStudentUseCase
 * @students UseCase
 */
@Injectable()
export class CreateStudentUseCase {
  /**
   * Creates a CreateStudentUseCase instance with required repositories
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
   * Creates a new student for a class
   *
   * @param {ICreateStudentDTO} data - Data required to create a student
   * @returns {Promise<Student>} The newly created student
   * @throws {NotFoundException} If the class is not found
   * @throws {ConflictException} If the teacher doesn't own the class or a student with the same registration already exists
   * @students Execute
   */
  async execute(data: ICreateStudentDTO): Promise<Student> {
    // Verificar se a turma existe
    const classExists = await this.classRepository.findById(data.classId);
    if (!classExists) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classExists.teacherId !== data.teacherId) {
      throw new ConflictException(
        'Você não tem permissão para adicionar estudantes a esta turma',
      );
    }

    // Verificar se já existe um estudante com a mesma matrícula na turma
    const existingStudent = await this.studentRepository.findByRegistrationAndClassId(
      data.registration,
      data.classId,
    );

    if (existingStudent) {
      throw new ConflictException(
        'Já existe um estudante com esta matrícula nesta turma',
      );
    }

    const newStudent = new Student({
      name: data.name,
      email: data.email,
      registration: data.registration,
      classId: data.classId,
    });

    return this.studentRepository.create(newStudent);
  }
}
