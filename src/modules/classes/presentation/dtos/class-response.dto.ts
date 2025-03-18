import { ApiProperty } from '@nestjs/swagger';

export class ClassResponseDto {
  @ApiProperty({
    description: 'ID da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome da turma',
    example: 'Programação Orientada a Objetos',
  })
    name: string;

  @ApiProperty({
    description: 'Código da turma',
    example: 'CS101',
    nullable: true,
  })
    code: string | null;

  @ApiProperty({
    description: 'Número da seção/turma',
    example: 1,
    default: 1,
  })
    section: number;

  @ApiProperty({
    description: 'Período letivo no formato "YYYY.N"',
    example: '2025.2',
  })
    period: string;

  @ApiProperty({
    description: 'ID do professor da turma',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    teacherId: string;

  @ApiProperty({
    description: 'Tipo de fórmula para cálculo da média',
    enum: ['simple', 'personalized'],
    example: 'simple',
  })
    typeFormula: 'simple' | 'personalized';

  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média. As notas são representadas por N1, N2, N3, etc.',
    example: '(N1 * 2 + N2 * 3 + N3 * 5) / 10',
    nullable: true,
  })
    averageFormula: string | null;

  @ApiProperty({
    description: 'Quantidade de estudantes na turma',
    example: 30,
    nullable: true,
  })
    studentCount: number | null;

  @ApiProperty({
    description: 'Data de criação da turma',
    example: '2025-01-01T00:00:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização da turma',
    example: '2025-01-01T00:00:00.000Z',
  })
    updatedAt: Date;
}
