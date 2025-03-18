import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,
} from 'class-validator';

export class UpdateGradeDto {
  @ApiProperty({
    description: 'Valor da nota (entre 0 e 10)',
    example: 8.5,
    minimum: 0,
    maximum: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
    value: number;

  @ApiProperty({
    description: 'Comentários sobre a nota',
    example: 'Excelente participação em sala de aula',
    required: false,
  })
  @IsOptional()
  @IsString()
    comments?: string;
}
