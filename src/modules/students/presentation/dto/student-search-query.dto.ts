import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling student search queries
 * Contains a single search parameter that can match either name or registration number
 *
 * @class StudentSearchQueryDto
 * @property {string} [search] - Search term to filter students by name or registration number
 */
export class StudentSearchQueryDto {
  @ApiProperty({
    description: 'Search term to filter students by name or registration number',
    required: false,
  })
  @IsOptional()
  @IsString()
    search?: string;
}
