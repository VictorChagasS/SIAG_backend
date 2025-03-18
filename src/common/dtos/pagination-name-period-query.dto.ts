import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from './pagination-query.dto';

/**
 * DTO combinado para paginação, pesquisa por nome e período
 */
export class PaginationNamePeriodQueryDto extends PaginationQueryDto {
  /**
   * Propriedades de NameSearchQueryDto
   */
  @ApiProperty({
    description: 'Filtrar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;

  /**
   * Propriedades de PeriodSearchQueryDto
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
 * DTO para paginação e pesquisa por nome
 */
export class PaginationNameQueryDto extends PaginationQueryDto {
  /**
   * Propriedades de NameSearchQueryDto
   */
  @ApiProperty({
    description: 'Filtrar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;
}
