import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator';

export class UpdateGradeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
    value: number;

  @IsOptional()
  @IsString()
    comments?: string;
}
