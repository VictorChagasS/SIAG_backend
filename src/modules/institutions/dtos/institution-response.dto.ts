import { ApiProperty } from '@nestjs/swagger';

export class InstitutionResponseDto {
  @ApiProperty({
    description: 'ID único da instituição',
    example: '1',
  })
    id: string;

  @ApiProperty({
    description: 'Nome da instituição',
    example: 'Universidade Federal da Paraíba',
  })
    name: string;

  @ApiProperty({
    description: 'Sigla da instituição',
    example: 'UFPB',
  })
    acronym: string;

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
