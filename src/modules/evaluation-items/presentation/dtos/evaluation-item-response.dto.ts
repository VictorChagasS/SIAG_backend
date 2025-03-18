import { ApiProperty } from '@nestjs/swagger';

export class EvaluationItemResponseDto {
  @ApiProperty({
    description: 'ID único do item de avaliação',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova 1',
  })
    name: string;

  @ApiProperty({
    description: 'ID da unidade à qual o item de avaliação pertence',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
    unitId: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2023-01-15T14:30:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2023-01-15T14:30:00.000Z',
  })
    updatedAt: Date;
}
