import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para busca de estudantes
 */
export class StudentSearchQueryDto {
  @ApiProperty({
    description: 'Termo de busca para filtrar por nome ou matrícula do estudante',
    required: false,
  })
  @IsOptional()
  @IsString()
    search?: string;
}
