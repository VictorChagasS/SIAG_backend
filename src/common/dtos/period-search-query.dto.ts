import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO base para parâmetros de pesquisa por período
 */
export class PeriodSearchQueryDto {
  @ApiProperty({
    description: 'Filtrar por período (ex: 2023.1)',
    required: false,
  })
  @IsOptional()
  @IsString()
    period?: string;
}
