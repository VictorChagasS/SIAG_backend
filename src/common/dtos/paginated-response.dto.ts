import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para metadados de paginação
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total de itens encontrados',
    example: 50,
  })
    total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
    page: number;

  @ApiProperty({
    description: 'Limite de itens por página',
    example: 10,
  })
    limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 5,
  })
    totalPages: number;
}

/**
 * DTO genérico para respostas paginadas
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Lista de itens',
    isArray: true,
  })
  @Type((options) => (options?.newObject as any)?.itemType)
    data: T[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMetaDto,
  })
    meta: PaginationMetaDto;
}
