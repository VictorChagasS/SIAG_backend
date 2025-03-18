/**
 * Update Unit Formula DTO
 *
 * Data Transfer Object for updating a unit's grade calculation formula.
 * Used for specialized formula updates separate from general unit updates.
 *
 * @module UnitDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

/**
 * DTO for handling unit formula update requests
 *
 * Contains fields specifically related to grade calculation formula updates.
 * Allows changing between simple and personalized formula types.
 *
 * @class UpdateUnitFormulaDto
 */
export class UpdateUnitFormulaDto {
  /**
   * Custom formula expression for grade calculation
   *
   * Required only when typeFormula is 'personalized'.
   * Uses variables like N1, N2, etc. to represent different evaluation item scores.
   */
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da unidade',
    example: '(N1 * 2 + N2 * 3) / 5',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    formula?: string;

  /**
   * Type of formula to use for grade calculation
   *
   * Determines whether to use a simple average or a custom formula.
   * When set to 'personalized', the formula field becomes required.
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
