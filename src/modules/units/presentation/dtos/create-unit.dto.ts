/**
 * Create Unit DTO
 *
 * Data Transfer Object for creating new units within a class.
 * Contains the minimal required data for unit creation.
 *
 * @module UnitDTOs
 * @units DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling unit creation requests
 *
 * Contains the required name and optional formula for creating a new unit.
 * The class ID is provided via the route parameter rather than in this DTO.
 *
 * @class CreateUnitDto
 * @units Create
 */
export class CreateUnitDto {
  /**
   * Name of the unit
   *
   * Required field that identifies the unit within a class.
   * Often represents academic periods like "First Bimester", "Second Trimester", etc.
   *
   * @units Property
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
   *
   * @units Property
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
