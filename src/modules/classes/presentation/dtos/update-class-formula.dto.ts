import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

export class UpdateClassFormulaDto {
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    formula?: string;

  @IsNotEmpty({ message: 'O tipo de fórmula é obrigatório' })
  @IsEnum(['simple', 'personalized'], { message: 'O tipo de fórmula deve ser "simple" ou "personalized"' })
    typeFormula: ITypeFormula;
}
