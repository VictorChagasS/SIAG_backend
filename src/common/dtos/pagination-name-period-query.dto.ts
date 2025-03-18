/**
 * Combined Pagination Query DTOs
 *
 * Combined DTOs for pagination with name and/or period filtering.
 * These DTOs extend the base pagination DTO with additional search parameters.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto';

/**
 * DTO for pagination with name and period filtering
 *
 * Extends the base pagination DTO with name and period search parameters.
 * Commonly used for academic/class-related API endpoints.
 *
 * @class PaginationNamePeriodQueryDto
 * @extends {PaginationQueryDto}
 */
export class PaginationNamePeriodQueryDto extends PaginationQueryDto {
  /**
   * Optional name filter parameter
   *
   * Used to filter results by name using a case-insensitive contains match
   */
  @ApiProperty({
    description: 'Filtrar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;

  /**
   * Optional period filter parameter
   *
   * Used to filter results by academic period (e.g., "2023.1")
   * Generally follows the format YYYY.N where N is the semester number
   */
  @ApiProperty({
    description: 'Filtrar por período (ex: 2023.1)',
    required: false,
  })
  @IsOptional()
  @IsString()
    period?: string;
}

/**
 * DTO for pagination with name filtering
 *
 * Extends the base pagination DTO with a name search parameter.
 * Used for API endpoints that need pagination and name-based filtering.
 *
 * @class PaginationNameQueryDto
 * @extends {PaginationQueryDto}
 */
export class PaginationNameQueryDto extends PaginationQueryDto {
  /**
   * Optional name filter parameter
   *
   * Used to filter results by name using a case-insensitive contains match
   */
  @ApiProperty({
    description: 'Filtrar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;
}
