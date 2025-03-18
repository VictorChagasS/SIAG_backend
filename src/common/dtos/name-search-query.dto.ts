/**
 * Name Search Query DTO
 *
 * Base DTO for filtering queries by name.
 * Used as a foundation for other DTOs that need name-based search functionality.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Base DTO for name search parameters
 *
 * Contains a single optional name property for filtering results
 * by a text-based name field.
 *
 * @class NameSearchQueryDto
 */
export class NameSearchQueryDto {
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
