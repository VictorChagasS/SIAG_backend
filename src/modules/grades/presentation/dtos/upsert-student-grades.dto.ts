import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested,
} from 'class-validator';

export class GradeItemDto {
  @ApiProperty({
    description: 'ID do item de avaliação',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
    evaluationItemId: string;

  @ApiProperty({
    description: 'Valor da nota (entre 0 e 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
    value: number;

  @ApiProperty({
    description: 'Comentários sobre a nota',
    example: 'Excelente participação em sala de aula',
    required: false,
  })
  @IsString()
  @IsOptional()
    comments?: string;

  @ApiProperty({
    description: 'ID da unidade à qual o item de avaliação pertence',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsString()
    unitId: string;
}

export class UpsertStudentGradesDto {
  @ApiProperty({
    description: 'Lista de notas a serem inseridas/atualizadas',
    type: [GradeItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => GradeItemDto)
    grades: GradeItemDto[];
}
