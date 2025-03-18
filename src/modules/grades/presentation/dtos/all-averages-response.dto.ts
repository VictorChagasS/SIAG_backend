import { ApiProperty } from '@nestjs/swagger';

class UnitAverageDto {
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
}

class StudentAverageDto {
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
    description: 'Média geral do estudante',
    example: 8.5,
  })
    average: number;

  @ApiProperty({
    description: 'Lista de médias por unidade',
    type: [UnitAverageDto],
  })
    unitAverages: UnitAverageDto[];
}

export class AllAveragesResponseDto {
  @ApiProperty({
    description: 'ID da turma',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
    classId: string;

  @ApiProperty({
    description: 'Nome da turma',
    example: 'Matemática - Turma A',
  })
    className: string;

  @ApiProperty({
    description: 'Lista de médias dos estudantes',
    type: [StudentAverageDto],
  })
    studentAverages: StudentAverageDto[];
}
