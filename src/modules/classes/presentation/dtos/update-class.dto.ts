import {
  IsOptional, IsString, Matches, IsInt, IsPositive,
} from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
    name?: string;

  @IsString()
  @IsOptional()
    code?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
    section?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period?: string;
}
