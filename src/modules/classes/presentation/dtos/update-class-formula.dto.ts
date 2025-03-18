import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

export class UpdateClassFormulaDto {
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da turma. As notas são representadas por N1, N2, N3, etc.',
    example: '(N1 * 2 + N2 * 3 + N3 * 5) / 10',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    formula?: string;

  @ApiProperty({
    description: 'Tipo de fórmula para cálculo da média',
    enum: ['simple', 'personalized'],
    example: 'simple',
  })
  @IsNotEmpty({ message: 'O tipo de fórmula é obrigatório' })
  @IsEnum(['simple', 'personalized'], { message: 'O tipo de fórmula deve ser "simple" ou "personalized"' })
    typeFormula: ITypeFormula;
}
