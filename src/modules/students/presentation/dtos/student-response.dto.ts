import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({
    description: 'ID único do estudante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
    id: string;

  @ApiProperty({
    description: 'Nome completo do estudante',
    example: 'João da Silva',
  })
    name: string;

  @ApiProperty({
    description: 'E-mail do estudante (opcional)',
    example: 'joao.silva@exemplo.com',
    required: false,
  })
    email?: string;

  @ApiProperty({
    description: 'Número de matrícula do estudante',
    example: '20230001',
  })
    registration: string;

  @ApiProperty({
    description: 'ID da turma à qual o estudante pertence',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
    classId: string;

  @ApiProperty({
    description: 'Data de criação do registro do estudante',
    example: '2023-01-15T14:30:00.000Z',
  })
    createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro do estudante',
    example: '2023-01-15T14:30:00.000Z',
  })
    updatedAt: Date;
}
