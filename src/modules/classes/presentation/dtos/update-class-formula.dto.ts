/**
 * Update Class Formula DTO
 *
 * Data Transfer Object for updating the grade calculation formula of a class.
 * Contains validation rules for ensuring data integrity when changing the formula type
 * and the custom formula expression.
 *
 * @module ClassDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

/**
 * DTO for handling class formula update requests
 *
 * Contains the data needed to update the formula used for calculating
 * student grades in a class.
 *
 * @class UpdateClassFormulaDto
 */
export class UpdateClassFormulaDto {
  /**
   * Custom formula expression for grade calculation
   *
   * Optional field required only when typeFormula is 'personalized'.
   * Uses N1, N2, N3, etc. to represent different grade components.
   */
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da turma. As notas são representadas por N1, N2, N3, etc.',
    example: '(N1 * 2 + N2 * 3 + N3 * 5) / 10',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    formula?: string;

  /**
   * Type of formula calculation to use
   *
   * Required field that determines whether to use the system's default formula
   * ('simple') or a custom teacher-defined formula ('personalized').
   */
  @ApiProperty({
    description: 'Tipo de fórmula para cálculo da média',
    enum: ['simple', 'personalized'],
    example: 'simple',
  })
  @IsNotEmpty({ message: 'O tipo de fórmula é obrigatório' })
  @IsEnum(['simple', 'personalized'], { message: 'O tipo de fórmula deve ser "simple" ou "personalized"' })
    typeFormula: ITypeFormula;
}
