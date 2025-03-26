/**
 * Paginated Response DTOs
 *
 * Generic DTOs for standardized paginated responses across the application.
 * Provides metadata about pagination and typed data arrays.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for pagination metadata
 *
 * Contains information about the pagination state, including
 * the total count, current page, items per page, and total pages.
 *
 * @class PaginationMetaDto
 */
export class PaginationMetaDto {
  /**
   * Total number of items across all pages
   */
  @ApiProperty({
    description: 'Total de itens encontrados',
    example: 50,
  })
    total: number;

  /**
   * Current page number
   */
  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
    page: number;

  /**
   * Maximum items per page
   */
  @ApiProperty({
    description: 'Limite de itens por página',
    example: 10,
  })
    limit: number;

  /**
   * Total number of pages available
   */
  @ApiProperty({
    description: 'Total de páginas',
    example: 5,
  })
    totalPages: number;
}

/**
 * Generic DTO for paginated responses
 *
 * A type-safe generic response format for paginated data.
 * Includes the data array and pagination metadata.
 *
 * @class PaginatedResponseDto
 * @template T The type of items in the data array
 */
export class PaginatedResponseDto<T> {
  /**
   * Array of items for the current page
   */
  @ApiProperty({
    description: 'Lista de itens',
    isArray: true,
  })
  @Type((options) => (options?.newObject as any)?.itemType)
    data: T[];

  /**
   * Pagination metadata
   */
  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMetaDto,
  })
    meta: PaginationMetaDto;
}
