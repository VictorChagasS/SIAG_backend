import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt, IsOptional, IsPositive, Min,
} from 'class-validator';

/**
 * DTO base para parâmetros de paginação
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Número da página',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
    page?: number = 1;

  @ApiProperty({
    description: 'Limite de itens por página',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive()
    limit?: number = 10;
}
