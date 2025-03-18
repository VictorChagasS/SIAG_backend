import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEvaluationItemDto {
  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova Final',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;
}
