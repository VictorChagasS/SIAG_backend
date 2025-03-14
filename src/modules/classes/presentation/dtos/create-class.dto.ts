import {
  IsNotEmpty, IsString, Matches,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
    name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}\.\d+$/, {
    message: 'O período deve estar no formato "YYYY.N" (ex: "2025.2")',
  })
    period: string;
}
