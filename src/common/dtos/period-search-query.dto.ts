/**
 * Period Search Query DTO
 *
 * Base DTO for filtering queries by academic period.
 * Used as a foundation for other DTOs that need period-based search functionality.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Base DTO for period search parameters
 *
 * Contains a single optional period property for filtering results
 * by academic period (typically in format YYYY.N).
 *
 * @class PeriodSearchQueryDto
 */
export class PeriodSearchQueryDto {
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
