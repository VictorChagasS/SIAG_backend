/**
 * Get Teacher Active Classes Report Use Case
 *
 * Implementa a lógica de negócios para gerar relatórios sobre as turmas ativas
 * de um professor, incluindo as médias de cada turma.
 *
 * @module Reports
 */
import { Inject, Injectable } from '@nestjs/common';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';
import { IStudentRepository } from '@/modules/students/domain/repositories/student-repository.interface';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { UNIT_REPOSITORY } from '@/modules/units/units.providers';

import { TeacherActiveClassesReportDto, UnitAverageDto } from '../../presentation/dtos/teacher-active-classes-report.dto';

/**
 * Serviço para gerar um relatório sobre as turmas ativas do professor
 *
 * Analisa as turmas ativas e calcula as médias para cada uma delas,
 * fornecendo uma visão geral do desempenho das turmas do professor.
 *
 * @class GetTeacherActiveClassesReportUseCase
 * @reports UseCase
 */
@Injectable()
export class GetTeacherActiveClassesReportUseCase {
  /**
   * Cria uma instância do caso de uso com as dependências necessárias
   *
   * @param {IClassRepository} classRepository - Repositório para acesso de dados de turmas
   * @param {IStudentRepository} studentRepository - Repositório para acesso de dados de estudantes
   * @param {IUnitRepository} unitRepository - Repositório para acesso de dados de unidades
   * @param {CalculateAllAveragesUseCase} calculateAllAveragesUseCase - Serviço para calcular médias de estudantes
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
   * Gera um relatório das turmas ativas do professor com suas médias
   *
   * @param {string} teacherId - ID do professor para gerar o relatório
   * @returns {Promise<TeacherActiveClassesReportDto>} O relatório de turmas ativas com médias
   */
  async execute(teacherId: string): Promise<TeacherActiveClassesReportDto> {
    // Buscar todas as turmas ativas do professor
    const activeClasses = await this.classRepository.findActiveByTeacherId(teacherId);

    if (activeClasses.length === 0) {
      return {
        teacherId,
        classes: [],
        totalClasses: 0,
        generatedAt: new Date(),
      };
    }

    // Para cada turma, calcular as médias
    const classesWithAverages = await Promise.all(
      activeClasses.map(async (classEntity) => {
        // Obter as unidades da turma
        const units = await this.unitRepository.findByClassId(classEntity.id);

        // Obter todos os alunos da turma para contar
        const students = await this.studentRepository.findByClassId(classEntity.id);
        const studentCount = students.length;

        // Obter todas as médias dos alunos da turma
        // (que já consideram o tipo de fórmula configurado para cada aluno)
        const allAverages = await this.calculateAllAveragesUseCase.execute(
          teacherId,
          classEntity.id,
        );

        // Calcular médias por unidade
        const unitAverages: UnitAverageDto[] = [];

        // Mapear médias por unidade
        if (units.length > 0) {
          // Transformar o array de unidades em médias por unidade
          const mappedUnitAverages = units.map((unit) => {
            // Coletar todas as médias de alunos para esta unidade
            const unitGrades = allAverages.studentAverages
              .map((studentAverage) => {
                const unitAverage = studentAverage.unitAverages.find(
                  (ua) => ua.unitId === unit.id,
                );
                return unitAverage ? unitAverage.average : null;
              })
              .filter((grade): grade is number => grade !== null);

            // Calcular média da unidade como uma média simples das médias dos alunos
            // independentemente de como as médias dos alunos foram calculadas
            const average = this.calculateAverage(unitGrades);

            return {
              unitId: unit.id,
              unitName: unit.name,
              average,
            };
          });

          unitAverages.push(...mappedUnitAverages);
        }

        // Calcular média geral da turma como a média simples das médias dos alunos
        // que já foram calculadas considerando o tipo de fórmula da turma
        const classGrades = allAverages.studentAverages.map((sa) => sa.average);
        const classAverage = this.calculateAverage(classGrades);

        return {
          classId: classEntity.id,
          className: classEntity.name,
          classCode: classEntity.code,
          section: classEntity.section,
          period: classEntity.period,
          studentCount,
          average: classAverage,
          unitAverages,
        };
      }),
    );

    return {
      teacherId,
      classes: classesWithAverages,
      totalClasses: classesWithAverages.length,
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
}
