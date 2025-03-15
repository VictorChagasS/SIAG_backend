import { IsOptional, IsString } from 'class-validator';

export class UpdateEvaluationItemDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;
}
