/**
 * Generate Grade Distribution Report Use Case
 *
 * Implements the business logic for generating reports on the distribution
 * of grades across predefined ranges for a class or specific unit.
 *
 * @module Reports
 */
import {
  Inject, Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';
import { GetAllGradesByClassUseCase } from '@/modules/grades/domain/usecases/get-all-grades-by-class.usecase';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { GradeDistributionReportDto, GradeRangeDto } from '../../presentation/dtos/grade-distribution-report.dto';

/**
 * Service for generating a report on the distribution of grades across ranges
 *
 * Analyzes grade data to group students into grade ranges, providing:
 * - Distribution of students across predefined grade ranges
 * - Count and percentage of students in each range
 * - Support for both class-wide and unit-specific distributions
 *
 * @class GenerateGradeDistributionReportUseCase
 * @reports UseCase
 */
@Injectable()
export class GenerateGradeDistributionReportUseCase {
  /**
   * Standard grade ranges used for distribution analysis, from low to high
   * Each range is defined by [min, max] values where min is inclusive and max is exclusive,
   * except for the last range where max is inclusive
   * @private
   */
  private readonly GRADE_RANGES = [
    { min: 0, max: 4 }, // 0 até menor que 4
    { min: 4, max: 6 }, // 4 até menor que 6
    { min: 6, max: 8 }, // 6 até menor que 8
    { min: 8, max: 10 }, // 8 até 10 inclusive
  ];

  /**
   * Creates a use case instance with required dependencies
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Service for calculating student averages
   * @param {GetAllGradesByClassUseCase} getAllGradesByClassUseCase - Service for retrieving all grades
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
    private getAllGradesByClassUseCase: GetAllGradesByClassUseCase,
  ) {}

  /**
   * Generates a report on the distribution of grades for a class
   *
   * @param {string} classId - ID of the class to generate a report for
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @param {string} [unitId] - Optional ID of a specific unit (for unit-specific distribution)
   * @returns {Promise<GradeDistributionReportDto>} The generated grade distribution report
   * @throws {NotFoundException} If the class or unit is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   */
  async execute(
    classId: string,
    teacherId: string,
    unitId?: string,
  ): Promise<GradeDistributionReportDto> {
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
        unitId,
        unitName: unitId ? 'Unidade não encontrada' : undefined,
        distribution: [],
        totalStudents: 0,
        generatedAt: new Date(),
      };
    }

    // Se tiver unitId, verifica se existe
    let unitName: string | undefined;
    if (unitId) {
      const unit = await this.unitRepository.findById(unitId);
      if (!unit) {
        throw new NotFoundException('Unidade não encontrada');
      }

      if (unit.classId !== classId) {
        throw new ForbiddenException(
          'Esta unidade não pertence à turma especificada',
        );
      }

      unitName = unit.name;
    }

    // Obter todas as médias dos alunos (que consideram as fórmulas configuradas)
    const allAverages = await this.calculateAllAveragesUseCase.execute(teacherId, classId);

    // Obter os dados de notas para distribuição
    const grades: number[] = [];

    if (unitId) {
      // Se for uma unidade específica, extrair as médias dos alunos para essa unidade
      allAverages.studentAverages.forEach((studentAverage) => {
        const unitAverage = studentAverage.unitAverages.find(
          (ua) => ua.unitId === unitId,
        );
        if (unitAverage) {
          grades.push(unitAverage.average);
        }
      });

      // Se não encontrou médias calculadas, tentar usar as notas brutas
      if (grades.length === 0) {
        // Obter todas as notas da turma
        const allGrades = await this.getAllGradesByClassUseCase.execute(classId, teacherId);

        // Filtrar as notas da unidade específica e agregar por aluno
        const studentGrades: Record<string, number[]> = {};

        allGrades.grades.forEach((grade) => {
          if (grade.unitId === unitId) {
            if (!studentGrades[grade.studentId]) {
              studentGrades[grade.studentId] = [];
            }
            studentGrades[grade.studentId].push(grade.value);
          }
        });

        // Calcular a média de cada aluno na unidade
        Object.values(studentGrades).forEach((studentGradeValues) => {
          if (studentGradeValues.length > 0) {
            const sum = studentGradeValues.reduce((acc, value) => acc + value, 0);
            const avg = sum / studentGradeValues.length;
            grades.push(avg);
          }
        });
      }
    } else {
      // Caso contrário, usar as médias gerais dos alunos
      grades.push(...allAverages.studentAverages.map((s) => s.average));
    }

    // Calcular a distribuição das notas
    const distribution = this.calculateDistribution(grades);

    return {
      classId,
      className: classEntity.name,
      unitId,
      unitName,
      distribution,
      totalStudents,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculates the distribution of grades across predefined ranges
   *
   * Para evitar a dupla contagem, as notas são distribuídas da seguinte forma:
   * - Cada intervalo inclui seu valor mínimo mas exclui seu valor máximo
   * - O último intervalo é uma exceção e inclui tanto o valor mínimo quanto o máximo
   *
   * @param {number[]} grades - Array of grade values to analyze
   * @returns {GradeRangeDto[]} The calculated grade distribution across ranges
   * @private
   */
  private calculateDistribution(grades: number[]): GradeRangeDto[] {
    if (grades.length === 0) return [];

    const totalGrades = grades.length;
    const distribution: GradeRangeDto[] = this.GRADE_RANGES.map((range, index) => {
      const { min, max } = range;
      const isLastRange = index === this.GRADE_RANGES.length - 1;

      const count = grades.filter((grade) => {
        if (isLastRange) {
          // Para o último intervalo, incluímos ambos min e max
          return grade >= min && grade <= max;
        }
        // Para os outros intervalos, incluímos min mas excluímos max
        return grade >= min && grade < max;
      }).length;

      const percentage = Math.round((count / totalGrades) * 100 * 100) / 100;

      return {
        min,
        max,
        count,
        percentage,
      };
    });

    return distribution;
  }
}
