/**
 * Unit Statistics Report DTO
 *
 * Define a estrutura de dados para relatórios estatísticos
 * de cada unidade dentro de uma turma, fornecendo métricas de desempenho.
 *
 * @module Reports
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * Dados estatísticos de uma unidade específica
 */
export class UnitStatisticsDto {
  /**
   * ID único da unidade
   */
  @ApiProperty({
    description: 'ID único da unidade',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
    unitId: string;

  /**
   * Nome da unidade
   */
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 2 - Geometria',
  })
    unitName: string;

  /**
   * Média da unidade considerando todos os alunos
   */
  @ApiProperty({
    description: 'Média da unidade',
    example: 7.4,
  })
    average: number;

  /**
   * Nota mais alta alcançada na unidade
   */
  @ApiProperty({
    description: 'Nota mais alta na unidade',
    example: 9.8,
  })
    highestGrade: number;

  /**
   * Nota mais baixa alcançada na unidade
   */
  @ApiProperty({
    description: 'Nota mais baixa na unidade',
    example: 3.2,
  })
    lowestGrade: number;

  /**
   * Mediana das notas na unidade
   */
  @ApiProperty({
    description: 'Mediana das notas na unidade',
    example: 7.6,
  })
    medianGrade: number;
}

/**
 * DTO para o relatório de estatísticas por unidade
 *
 * Contém métricas estatísticas para todas as unidades de uma turma
 */
export class UnitStatisticsReportDto {
  /**
   * ID único da turma
   */
  @ApiProperty({
    description: 'ID único da turma',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
    classId: string;

  /**
   * Nome da turma
   */
  @ApiProperty({
    description: 'Nome da turma',
    example: 'Matemática - 9º Ano A',
  })
    className: string;

  /**
   * Estatísticas de cada unidade
   */
  @ApiProperty({
    description: 'Estatísticas de cada unidade',
    type: [UnitStatisticsDto],
  })
    unitStatistics: UnitStatisticsDto[];

  /**
   * Número total de alunos na turma
   */
  @ApiProperty({
    description: 'Número total de alunos na turma',
    example: 32,
  })
    totalStudents: number;

  /**
   * Data de geração do relatório
   */
  @ApiProperty({
    description: 'Data de geração do relatório',
    example: '2023-06-15T14:30:45Z',
  })
    generatedAt: Date;
}
