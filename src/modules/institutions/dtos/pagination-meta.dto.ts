import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Número total de registros',
    example: 120,
  })
    total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
    page: number;

  @ApiProperty({
    description: 'Limite de registros por página',
    example: 10,
  })
    limit: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 12,
  })
    totalPages: number;
}
