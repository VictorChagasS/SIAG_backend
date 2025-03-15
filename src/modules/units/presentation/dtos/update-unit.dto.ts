import { IsOptional, IsString } from 'class-validator';

export class UpdateUnitDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    averageFormula?: string;
}
