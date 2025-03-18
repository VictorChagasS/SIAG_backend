/**
 * Upsert Unit DTO
 *
 * Data Transfer Object for creating or updating units within a class.
 * Used in upsert operations where the unit will be created if it doesn't exist,
 * or updated if it does exist with the same name.
 *
 * @module UnitDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling unit upsert requests
 *
 * Contains the required name to identify the unit and optional formula.
 * Used in combination with the class ID route parameter to create or update units.
 *
 * @class UpsertUnitDto
 */
export class UpsertUnitDto {
  /**
   * Name of the unit
   *
   * Required field that identifies the unit within a class.
   * Used to determine whether to create a new unit or update an existing one.
   */
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
    name: string;

  /**
   * Custom formula for calculating the unit average
   *
   * Optional field that defines how grades within this unit are weighted.
   * If not provided, the system will use the default simple average.
   */
  @ApiProperty({
    description: 'Fórmula personalizada para cálculo da média da unidade',
    example: '(N1 * 2 + N2 * 3) / 5',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A fórmula deve ser uma string' })
    averageFormula?: string;
}
