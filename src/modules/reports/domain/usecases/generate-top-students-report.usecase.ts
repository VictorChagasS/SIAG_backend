/**
 * Generate Top Students Report Use Case
 *
 * Implements the business logic for generating reports on the highest-performing
 * students in a class, either overall or within a specific unit.
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
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { TopStudentsReportDto, TopStudentDto } from '../../presentation/dtos/top-students-report.dto';

/**
 * Service for generating a report on the top-performing students in a class
 *
 * Analyzes grade data to identify and rank the highest-achieving students, providing:
 * - Ranked list of top students with their grades
 * - Support for both overall class performance and unit-specific rankings
 * - Student details including registration numbers and exact grades
 *
 * @class GenerateTopStudentsReportUseCase
 * @reports UseCase
 */
@Injectable()
export class GenerateTopStudentsReportUseCase {
  /**
   * Default number of top students to include in the report
   * @private
   */
  private readonly DEFAULT_TOP_COUNT = 10;

  /**
   * Creates a use case instance with required dependencies
   *
   * @param {IClassRepository} classRepository - Repository for class data access
   * @param {IStudentRepository} studentRepository - Repository for student data access
   * @param {IUnitRepository} unitRepository - Repository for unit data access
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Service for calculating student averages
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

  /**
   * Generates a report on the top-performing students in a class
   *
   * @param {string} classId - ID of the class to generate a report for
   * @param {string} teacherId - ID of the teacher (for permission validation)
   * @param {number} [topCount=10] - Number of top students to include (default: 10)
   * @param {string} [unitId] - Optional ID of a specific unit (for unit-specific ranking)
   * @returns {Promise<TopStudentsReportDto>} The generated top students report
   * @throws {NotFoundException} If the class or unit is not found
   * @throws {ForbiddenException} If the teacher doesn't own the class
   */
  async execute(
    classId: string,
    teacherId: string,
    topCount: number = this.DEFAULT_TOP_COUNT,
    unitId?: string,
  ): Promise<TopStudentsReportDto> {
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
        topStudents: [],
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

    // Criar mapa de estudantes por ID para acesso rápido
    const studentsMap: Record<string, { id: string; name: string; registration: string }> = {};
    students.forEach((student) => {
      studentsMap[student.id] = {
        id: student.id,
        name: student.name,
        registration: student.registration,
      };
    });

    // Obter as médias dos alunos (que já consideram o tipo de fórmula)
    const allAverages = await this.calculateAllAveragesUseCase.execute(teacherId, classId);

    let topStudents: TopStudentDto[] = [];

    if (unitId) {
      // Extrair as médias por unidade para a unidade específica
      const studentUnitAverages: { studentId: string; average: number }[] = [];

      allAverages.studentAverages.forEach((studentAverage) => {
        const unitAverage = studentAverage.unitAverages.find((ua) => ua.unitId === unitId);
        if (unitAverage) {
          studentUnitAverages.push({
            studentId: studentAverage.studentId,
            average: unitAverage.average,
          });
        }
      });

      // Ordenar por médias em ordem decrescente
      studentUnitAverages.sort((a, b) => b.average - a.average);

      // Pegar os top N alunos
      const limitedTopStudents = studentUnitAverages.slice(0, topCount);

      // Montar o relatório com detalhes completos
      topStudents = limitedTopStudents.map((data, index) => {
        const student = studentsMap[data.studentId];
        // Encontrar a média geral do estudante
        const studentAverage = allAverages.studentAverages.find(
          (avg) => avg.studentId === data.studentId,
        );

        return {
          studentId: data.studentId,
          studentName: student.name,
          registration: student.registration,
          rank: index + 1,
          average: studentAverage ? studentAverage.average : 0,
          unitGrade: data.average,
        };
      });
    } else {
      // Caso contrário, classificar os alunos com base nas médias gerais
      // Ordenar por médias em ordem decrescente
      const sortedAverages = [...allAverages.studentAverages].sort((a, b) => b.average - a.average);

      // Pegar os top N alunos
      const limitedTopStudents = sortedAverages.slice(0, topCount);

      // Montar o relatório com detalhes completos
      topStudents = limitedTopStudents.map((data, index) => {
        const student = studentsMap[data.studentId];
        return {
          studentId: data.studentId,
          studentName: student.name,
          registration: student.registration,
          rank: index + 1,
          average: data.average,
        };
      });
    }

    return {
      classId,
      className: classEntity.name,
      unitId,
      unitName,
      topStudents,
      totalStudents,
      generatedAt: new Date(),
    };
  }
}
