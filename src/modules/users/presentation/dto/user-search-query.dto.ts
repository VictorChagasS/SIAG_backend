/**
 * User Search Query DTO
 *
 * Data Transfer Object for querying users with a unified search parameter.
 * Handles search functionality that can match against multiple user fields.
 *
 * @module UserDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling user search queries
 *
 * Contains a single unified search parameter that can match against
 * multiple user fields (typically name or email) for flexible searching.
 *
 * @class UserSearchQueryDto
 */
export class UserSearchQueryDto {
  /**
   * Unified search parameter
   *
   * Optional search term that can match either user name or email
   * using a case-insensitive contains match.
   */
  @ApiProperty({
    description: 'Search term to filter users by name or email',
    required: false,
  })
  @IsOptional()
  @IsString()
    search?: string;
}
