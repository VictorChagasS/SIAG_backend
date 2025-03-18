/**
 * Calculate All Averages Use Case
 *
 * Implements the business logic for calculating average grades for all students
 * in a class. Aggregates individual student averages for overall class reporting.
 *
 * @module GradeUseCases
 * @grades Domain
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

import { CalculateStudentAverageUseCase } from './calculate-student-average.usecase';

/**
 * Unit average calculation result
 *
 * Contains the unit information and calculated average
 *
 * @interface IUnitAverageResult
 * @grades DTO
 */
interface IUnitAverageResult {
  /**
   * Unique identifier of the unit
   */
  unitId: string;

  /**
   * Display name of the unit
   */
  unitName: string;

  /**
   * Calculated average for the unit (rounded to 2 decimal places)
   */
  average: number;
}

/**
 * Student average calculation result with registration
 *
 * Contains overall student average, registration, and individual unit averages
 *
 * @interface IStudentAverageResult
 * @grades DTO
 */
interface IStudentAverageResult {
  /**
   * Unique identifier of the student
   */
  studentId: string;

  /**
   * Display name of the student
   */
  studentName: string;

  /**
   * Student's registration number or ID
   */
  studentRegistration: string;

  /**
   * Overall student average across all units (rounded to 2 decimal places)
   */
  average: number;

  /**
   * Collection of unit-specific averages for this student
   */
  unitAverages: IUnitAverageResult[];
}

/**
 * Result of calculating all student averages for a class
 *
 * Contains class information and averages for all students
 *
 * @interface IAllAveragesResult
 * @grades DTO
 */
interface IAllAveragesResult {
  /**
   * Unique identifier of the class
   */
  classId: string;

  /**
   * Display name of the class
   */
  className: string;

  /**
   * Collection of averages for all students in the class
   */
  studentAverages: IStudentAverageResult[];
}

/**
 * Service for calculating averages for all students in a class
 *
 * Handles the business logic for calculating averages for all students, including:
 * - Permission validation
 * - Aggregating results from individual student calculations
 * - Providing a comprehensive view of all student performances
 *
 * @class CalculateAllAveragesUseCase
 * @grades UseCase
 */
@Injectable()
export class CalculateAllAveragesUseCase {
  /**
   * Creates a use case instance with the required repositories and services
   *
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {CalculateStudentAverageUseCase} calculateStudentAverageUseCase - Service for calculating individual student averages
   * @grades Constructor
   */
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    private calculateStudentAverageUseCase: CalculateStudentAverageUseCase,
  ) {}

  /**
   * Calculates average grades for all students in a class
   *
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @param {string} classId - ID of the class
   * @returns {Promise<IAllAveragesResult>} The calculated averages for all students
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   * @grades Execute
   */
  async execute(teacherId: string, classId: string): Promise<IAllAveragesResult> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para calcular médias nesta turma',
      );
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    if (students.length === 0) {
      return {
        classId,
        className: classEntity.name,
        studentAverages: [],
      };
    }

    // Calcular a média para cada estudante
    const studentAverages = await Promise.all(
      students.map(async (student) => {
        const average = await this.calculateStudentAverageUseCase.execute(
          student.id,
          classId,
          teacherId,
        );

        return {
          studentId: student.id,
          studentName: student.name,
          studentRegistration: student.registration,
          average: average.average,
          unitAverages: average.unitAverages,
        };
      }),
    );

    return {
      classId,
      className: classEntity.name,
      studentAverages,
    };
  }
}
