/**
 * Pagination Query DTO
 *
 * Base DTO for pagination parameters used across the application.
 * Provides standardized pagination controls for API endpoints.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt, IsOptional, IsPositive, Min,
} from 'class-validator';

/**
 * Base DTO for pagination parameters
 *
 * Contains page number and limit properties for implementing
 * consistent pagination across all API endpoints.
 *
 * @class PaginationQueryDto
 */
export class PaginationQueryDto {
  /**
   * Current page number
   *
   * Optional with default value of 1.
   * Must be a positive integer.
   */
  @ApiProperty({
    description: 'Número da página',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
    page?: number = 1;

  /**
   * Maximum number of items per page
   *
   * Optional with default value of 10.
   * Must be a positive integer.
   */
  @ApiProperty({
    description: 'Limite de itens por página',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive()
    limit?: number = 10;
}
