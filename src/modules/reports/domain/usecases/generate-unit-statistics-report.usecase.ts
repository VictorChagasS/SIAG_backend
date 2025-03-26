/**
 * Generate Unit Statistics Report Use Case
 *
 * Implementa a lógica de negócios para gerar relatórios estatísticos
 * para cada unidade dentro de uma turma.
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

import { UnitStatisticsReportDto, UnitStatisticsDto } from '../../presentation/dtos/unit-statistics-report.dto';

/**
 * Serviço para gerar relatórios estatísticos para cada unidade em uma turma
 *
 * Analisa os dados de notas para fornecer estatísticas para cada unidade, incluindo:
 * - Nome da unidade
 * - Média das notas
 * - Mediana das notas
 * - Nota mais alta
 * - Nota mais baixa
 *
 * @class GenerateUnitStatisticsReportUseCase
 * @reports UseCase
 */
@Injectable()
export class GenerateUnitStatisticsReportUseCase {
  /**
   * Cria uma instância do caso de uso com as dependências necessárias
   *
   * @param {IClassRepository} classRepository - Repositório para acesso de dados de turmas
   * @param {IStudentRepository} studentRepository - Repositório para acesso de dados de estudantes
   * @param {IUnitRepository} unitRepository - Repositório para acesso de dados de unidades
   * @param {GetAllGradesByClassUseCase} getAllGradesByClassUseCase - Serviço para obter todas as notas
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Serviço para calcular médias dos estudantes
   */
  constructor(
    @Inject(CLASS_REPOSITORY)
    private classRepository: IClassRepository,
    @Inject(STUDENT_REPOSITORY)
    private studentRepository: IStudentRepository,
    @Inject(UNIT_REPOSITORY)
    private unitRepository: IUnitRepository,
    private getAllGradesByClassUseCase: GetAllGradesByClassUseCase,
    private calculateAllAveragesUseCase: CalculateAllAveragesUseCase,
  ) {}

  /**
   * Gera um relatório estatístico para cada unidade em uma turma
   *
   * @param {string} classId - ID da turma para gerar o relatório
   * @param {string} teacherId - ID do professor (para validação de permissão)
   * @returns {Promise<UnitStatisticsReportDto>} O relatório estatístico por unidade gerado
   * @throws {NotFoundException} Se a turma não for encontrada
   * @throws {ForbiddenException} Se o professor não for o dono da turma
   */
  async execute(
    classId: string,
    teacherId: string,
  ): Promise<UnitStatisticsReportDto> {
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
        unitStatistics: [],
        totalStudents: 0,
        generatedAt: new Date(),
      };
    }

    // Buscar todas as unidades da turma
    const units = await this.unitRepository.findByClassId(classId);
    if (units.length === 0) {
      return {
        classId,
        className: classEntity.name,
        unitStatistics: [],
        totalStudents,
        generatedAt: new Date(),
      };
    }

    // Obter todas as notas da turma
    const allGrades = await this.getAllGradesByClassUseCase.execute(classId, teacherId);

    // Obter as médias dos alunos (que já consideram o tipo de fórmula)
    const allAverages = await this.calculateAllAveragesUseCase.execute(teacherId, classId);

    // Gerar estatísticas para cada unidade
    const unitStatistics: UnitStatisticsDto[] = await Promise.all(
      units.map(async (unit) => {
        // Primeiro, coletamos as médias dos alunos para essa unidade específica
        // que já foram calculadas considerando o tipo de fórmula da unidade
        const studentAveragesForUnit = allAverages.studentAverages
          .map((studentAverage) => {
            const unitAverage = studentAverage.unitAverages.find(
              (ua) => ua.unitId === unit.id,
            );
            return unitAverage ? unitAverage.average : null;
          })
          .filter((grade): grade is number => grade !== null);

        // Se não houver médias dos alunos para a unidade, usar as notas brutas
        if (studentAveragesForUnit.length === 0) {
          // Filtrar as notas da unidade
          const unitGrades: number[] = [];

          allGrades.grades.forEach((grade) => {
            if (grade.unitId === unit.id) {
              unitGrades.push(grade.value);
            }
          });

          // Se não houver notas para a unidade, retornar estatísticas vazias
          if (unitGrades.length === 0) {
            return {
              unitId: unit.id,
              unitName: unit.name,
              average: 0,
              highestGrade: 0,
              lowestGrade: 0,
              medianGrade: 0,
            };
          }

          // Ordenar as notas para cálculos estatísticos
          unitGrades.sort((a, b) => a - b);

          // Calcular estatísticas com as notas brutas
          const average = this.calculateAverage(unitGrades);
          const medianGrade = this.calculateMedian(unitGrades);
          const lowestGrade = unitGrades[0] || 0;
          const highestGrade = unitGrades[unitGrades.length - 1] || 0;

          return {
            unitId: unit.id,
            unitName: unit.name,
            average,
            highestGrade,
            lowestGrade,
            medianGrade,
          };
        }

        // Ordenar as médias dos alunos para cálculos estatísticos
        studentAveragesForUnit.sort((a, b) => a - b);

        // A média da unidade é a média simples das médias dos alunos
        // independentemente de como as médias dos alunos foram calculadas
        const average = this.calculateAverage(studentAveragesForUnit);
        const medianGrade = this.calculateMedian(studentAveragesForUnit);
        const lowestGrade = studentAveragesForUnit[0] || 0;
        const highestGrade = studentAveragesForUnit[studentAveragesForUnit.length - 1] || 0;

        return {
          unitId: unit.id,
          unitName: unit.name,
          average,
          highestGrade,
          lowestGrade,
          medianGrade,
        };
      }),
    );

    return {
      classId,
      className: classEntity.name,
      unitStatistics,
      totalStudents,
      generatedAt: new Date(),
    };
  }

  /**
   * Calcula a média de um conjunto de valores
   *
   * @param {number[]} values - Array de valores para calcular a média
   * @returns {number} A média calculada, arredondada para 2 casas decimais
   * @private
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  /**
   * Calcula a mediana de um conjunto de valores
   *
   * @param {number[]} values - Array de valores para calcular a mediana
   * @returns {number} A mediana calculada, arredondada para 2 casas decimais
   * @private
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;

    const sortedValues = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sortedValues.length / 2);

    if (sortedValues.length % 2 === 0) {
      // Se o array tiver um número par de elementos, a mediana é a média dos dois elementos do meio
      return Math.round(((sortedValues[middle - 1] + sortedValues[middle]) / 2) * 100) / 100;
    }

    // Se o array tiver um número ímpar de elementos, a mediana é o elemento do meio
    return Math.round(sortedValues[middle] * 100) / 100;
  }
}
