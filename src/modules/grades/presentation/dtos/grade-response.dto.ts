import { ApiProperty } from '@nestjs/swagger';

export class GradeResponseDto {
  @ApiProperty({
    description: 'ID único da nota',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id: string;

  @ApiProperty({
    description: 'ID do estudante ao qual a nota pertence',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    studentId: string;

  @ApiProperty({
    description: 'ID do item de avaliação ao qual a nota pertence',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
    evaluationItemId: string;

  @ApiProperty({
    description: 'Valor da nota (entre 0 e 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
    value: number;

  @ApiProperty({
    description: 'Comentários sobre a nota',
    example: 'Excelente participação em sala de aula',
    required: false,
    nullable: true,
  })
    comments?: string;

  @ApiProperty({
    description: 'Data de criação do registro da nota',
    example: '2023-01-15T14:30:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro da nota',
    example: '2023-01-15T14:30:00.000Z',
  })
    updatedAt: Date;
}
