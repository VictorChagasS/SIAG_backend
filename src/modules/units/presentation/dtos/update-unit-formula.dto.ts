import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

export class UpdateUnitFormulaDto {
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da unidade',
    example: '(N1 * 2 + N2 * 3) / 5',
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
