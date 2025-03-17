import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested,
} from 'class-validator';

export class GradeItemDto {
  @IsUUID()
    evaluationItemId: string;

  @IsNumber()
  @Min(0)
  @Max(10)
    value: number;

  @IsString()
  @IsOptional()
    comments?: string;

  @IsString()
    unitId: string;
}

export class UpsertStudentGradesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => GradeItemDto)
    grades: GradeItemDto[];
}
