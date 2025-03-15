import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertUnitDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    averageFormula?: string;
}
