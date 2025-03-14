import {
  IsOptional, IsString, Matches,
} from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
    name?: string;

  @IsString()
  @IsOptional()
    code?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period?: string;
}
