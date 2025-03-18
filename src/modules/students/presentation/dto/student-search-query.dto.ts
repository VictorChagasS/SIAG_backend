/**
 * Student Search Query DTO
 *
 * Data Transfer Object for handling student search parameters in API requests.
 * Used for filtering students by name or registration.
 *
 * @module StudentDTOs
 * @students DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling student search queries
 * Contains a single search parameter that can match either name or registration number
 *
 * @class StudentSearchQueryDto
 * @property {string} [search] - Search term to filter students by name or registration number
 * @students Query
 */
export class StudentSearchQueryDto {
  /**
   * Search term for filtering students
   * Can match against student name or registration number
   *
   * @students Property
   */
  @ApiProperty({
    description: 'Search term to filter students by name or registration number',
    required: false,
  })
  @IsOptional()
  @IsString()
    search?: string;
}
