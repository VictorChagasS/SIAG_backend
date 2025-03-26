/**
 * Teacher Active Classes Report DTO
 *
 * Define a estrutura de dados para relatórios sobre as turmas ativas
 * de um professor, incluindo as médias de cada turma.
 *
 * @module Reports
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de informações de unidade com média
 */
export class UnitAverageDto {
  /**
   * ID único da unidade
   */
  @ApiProperty({
    description: 'ID único da unidade',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
    unitId: string;

  /**
   * Nome da unidade
   */
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Primeiro Bimestre',
  })
    unitName: string;

  /**
   * Média da unidade (arredondada para 2 casas decimais)
   */
  @ApiProperty({
    description: 'Média da unidade (arredondada para 2 casas decimais)',
    example: 7.85,
  })
    average: number;
}

/**
 * DTO para classe com médias
 */
export class ClassWithAveragesDto {
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
   * Código da turma (opcional)
   */
  @ApiProperty({
    description: 'Código da turma',
    example: 'MAT-9A',
    required: false,
  })
    classCode?: string;

  /**
   * Número da seção da turma
   */
  @ApiProperty({
    description: 'Número da seção da turma',
    example: 1,
  })
    section: number;

  /**
   * Período acadêmico da turma
   */
  @ApiProperty({
    description: 'Período acadêmico da turma',
    example: '2023.1',
  })
    period: string;

  /**
   * Quantidade de alunos na turma
   */
  @ApiProperty({
    description: 'Quantidade de alunos na turma',
    example: 32,
  })
    studentCount: number;

  /**
   * Média geral da turma (arredondada para 2 casas decimais)
   */
  @ApiProperty({
    description: 'Média geral da turma (arredondada para 2 casas decimais)',
    example: 7.65,
  })
    average: number;

  /**
   * Lista de médias por unidade
   */
  @ApiProperty({
    description: 'Lista de médias por unidade',
    type: [UnitAverageDto],
  })
    unitAverages: UnitAverageDto[];
}

/**
 * DTO do relatório de turmas ativas do professor
 */
export class TeacherActiveClassesReportDto {
  /**
   * ID do professor
   */
  @ApiProperty({
    description: 'ID do professor',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
    teacherId: string;

  /**
   * Lista de turmas ativas com suas médias
   */
  @ApiProperty({
    description: 'Lista de turmas ativas com suas médias',
    type: [ClassWithAveragesDto],
  })
    classes: ClassWithAveragesDto[];

  /**
   * Número total de turmas ativas
   */
  @ApiProperty({
    description: 'Número total de turmas ativas',
    example: 5,
  })
    totalClasses: number;

  /**
   * Data de geração do relatório
   */
  @ApiProperty({
    description: 'Data de geração do relatório',
    example: '2023-10-15T14:30:45Z',
  })
    generatedAt: Date;
}
