import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUnitDto {
  @ApiProperty({
    description: 'ID da unidade',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O ID deve ser uma string' })
    id?: string;

  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da unidade',
    example: '(N1 * 2 + N2 * 3) / 5',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    averageFormula?: string;
}
