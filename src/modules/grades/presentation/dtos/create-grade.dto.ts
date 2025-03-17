import {
  IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min,
} from 'class-validator';

export class CreateGradeDto {
  @IsNotEmpty()
  @IsUUID()
    studentId: string;

  @IsNotEmpty()
  @IsUUID()
    evaluationItemId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
    value: number;

  @IsOptional()
  @IsString()
    comments?: string;
}
