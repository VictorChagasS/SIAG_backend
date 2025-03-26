/**
 * Active Teacher Classes Query DTO
 *
 * Data Transfer Object for querying a teacher's active classes with name filtering.
 * Used in the controller to validate and process query parameters.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for name-based search in a teacher's active classes
 *
 * Contains the optional name parameter to filter active classes by name.
 *
 * @class ActiveTeacherClassesQueryDto
 */
export class ActiveTeacherClassesQueryDto {
  /**
   * Optional class name filter
   *
   * Used to filter classes by name using a case-insensitive contains match
   */
  @ApiProperty({
    description: 'Filtrar por nome da turma',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;
}
