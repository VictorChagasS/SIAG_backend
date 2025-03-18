import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEvaluationItemDto {
  @ApiProperty({
    description: 'Nome do item de avaliação',
    example: 'Prova 1',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;
}
