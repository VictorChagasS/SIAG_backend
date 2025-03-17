import {
  IsNotEmpty, IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
    name: string;

  @IsString()
  @IsOptional()
    code?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
    section?: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period: string;
}
