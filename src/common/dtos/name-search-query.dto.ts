import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO base para parâmetros de pesquisa por nome
 */
export class NameSearchQueryDto {
  @ApiProperty({
    description: 'Filtrar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
    name?: string;
}
