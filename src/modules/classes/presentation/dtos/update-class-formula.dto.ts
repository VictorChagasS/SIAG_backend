import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClassFormulaDto {
  @IsNotEmpty({ message: 'A fórmula de cálculo é obrigatória' })
  @IsString({ message: 'A fórmula deve ser uma string' })
    formula: string;
}
