import { ApiProperty } from '@nestjs/swagger';

class GradeItemResponseDto {
  @ApiProperty({
    description: 'ID do item de avaliação',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
    evaluationItemId: string;

  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova 1',
  })
    evaluationItemName: string;

  @ApiProperty({
    description: 'Valor da nota',
    example: 8.5,
  })
    value: number;
}

export class UnitAverageResponseDto {
  @ApiProperty({
    description: 'ID do estudante',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    studentId: string;

  @ApiProperty({
    description: 'Nome do estudante',
    example: 'João da Silva',
  })
    studentName: string;

  @ApiProperty({
    description: 'ID da unidade',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
    unitId: string;

  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
  })
    unitName: string;

  @ApiProperty({
    description: 'Média das notas da unidade',
    example: 8.7,
  })
    average: number;

  @ApiProperty({
    description: 'Lista de notas dos itens de avaliação',
    type: [GradeItemResponseDto],
  })
    grades: GradeItemResponseDto[];
}
