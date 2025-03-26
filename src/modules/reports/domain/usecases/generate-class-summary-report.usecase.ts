/**
 * Generate Class Summary Report Use Case
 *
 * Implements the business logic for generating comprehensive summary reports
 * about a class's overall performance statistics.
 *
 * @module Reports
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

import { ClassSummaryReportDto } from '../../presentation/dtos/class-summary-report.dto';

/**
 * Service for generating a comprehensive summary report of a class's performance
 *
 * Analyzes grade data to provide key performance indicators, including:
 * - Class average
 * - Approval rate
 * - Student counts
 * - Grade ranges (highest, lowest, median)
 *
 * @class GenerateClassSummaryReportUseCase
 * @reports UseCase
 */
@Injectable()
export class GenerateClassSummaryReportUseCase {
  /**
   * Pass mark threshold (students with grades >= this value are considered approved)
   * @private
   */
  private readonly PASS_MARK = 5.0;

  /**
   * Creates a use case instance with required dependencies
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Service for calculating all student averages
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

  /**
   * Generates a comprehensive summary report for a class
   *
   * @param {string} classId - ID of the class to generate a report for
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @returns {Promise<ClassSummaryReportDto>} The generated class summary report
   * @throws {NotFoundException} If the class is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   */
  async execute(classId: string, teacherId: string): Promise<ClassSummaryReportDto> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Verificar se o professor é o dono da turma
    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para gerar relatórios para esta turma',
      );
    }

    // Buscar todos os estudantes da turma
    const students = await this.studentRepository.findByClassId(classId);
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return {
        classId,
        className: classEntity.name,
        classAverage: 0,
        totalStudents: 0,
        studentsApproved: 0,
        approvalRate: 0,
        highestGrade: 0,
        lowestGrade: 0,
        medianGrade: 0,
        generatedAt: new Date(),
      };
    }

    // Calcular as médias de todos os alunos
    const allAverages = await this.calculateAllAveragesUseCase.execute(teacherId, classId);

    // Ordenar as médias para cálculos estatísticos
    const sortedAverages = [...allAverages.studentAverages]
      .sort((a, b) => a.average - b.average);

    // Calcular estatísticas
    const classAverage = this.calculateAverage(sortedAverages.map((s) => s.average));
    const highestGrade = sortedAverages.length > 0 ? sortedAverages[sortedAverages.length - 1].average : 0;
    const lowestGrade = sortedAverages.length > 0 ? sortedAverages[0].average : 0;
    const medianGrade = this.calculateMedian(sortedAverages.map((s) => s.average));

    // Calcular taxa de aprovação
    const studentsApproved = sortedAverages.filter((s) => s.average >= this.PASS_MARK).length;
    const approvalRate = totalStudents > 0 ? (studentsApproved / totalStudents) * 100 : 0;

    return {
      classId,
      className: classEntity.name,
      classAverage,
      totalStudents,
      studentsApproved,
      approvalRate,
      highestGrade,
      lowestGrade,
      medianGrade,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculates the average of an array of numbers
   *
   * @param {number[]} values - Array of numbers to calculate the average of
   * @returns {number} The calculated average, rounded to 2 decimal places
   * @private
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  /**
   * Calculates the median of an array of numbers
   *
   * @param {number[]} values - Array of numbers to calculate the median of
   * @returns {number} The calculated median, rounded to 2 decimal places
   * @private
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sortedValues = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 0) {
      return Math.round(((sortedValues[middle - 1] + sortedValues[middle]) / 2) * 100) / 100;
    }

    return Math.round(sortedValues[middle] * 100) / 100;
  }
}
