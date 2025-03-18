import { ApiProperty } from '@nestjs/swagger';

export class UnitResponseDto {
  @ApiProperty({
    description: 'ID único da unidade',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
  })
    name: string;

  @ApiProperty({
    description: 'ID da turma à qual a unidade pertence',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    classId: string;

  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da unidade',
    example: '(N1 * 2 + N2 * 3) / 5',
    nullable: true,
    required: false,
  })
    averageFormula?: string;

  @ApiProperty({
    description: 'Tipo de fórmula para cálculo da média',
    enum: ['simple', 'personalized'],
    example: 'simple',
  })
    typeFormula: 'simple' | 'personalized';

  @ApiProperty({
    description: 'Data de criação do registro da unidade',
    example: '2023-01-15T14:30:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro da unidade',
    example: '2023-01-15T14:30:00.000Z',
  })
    updatedAt: Date;
}
