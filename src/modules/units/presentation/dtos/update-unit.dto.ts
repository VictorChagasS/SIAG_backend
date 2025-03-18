/**
 * Update Unit DTO
 *
 * Data Transfer Object for updating existing units within a class.
 * All fields are optional to support partial updates.
 *
 * @module UnitDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for handling unit update requests
 *
 * Contains the optional fields that can be updated on a unit.
 * The unit ID is typically provided via the route parameter rather than in this DTO.
 *
 * @class UpdateUnitDto
 */
export class UpdateUnitDto {
  /**
   * ID of the unit
   *
   * Optional field typically provided via route parameter instead.
   * Included here for completeness but rarely used in request body.
   */
  @ApiProperty({
    description: 'ID da unidade',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O ID deve ser uma string' })
    id?: string;

  /**
   * Updated name of the unit
   *
   * Optional field to change the unit's name.
   */
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade 1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
    name?: string;

  /**
   * Updated custom formula for calculating the unit average
   *
   * Optional field to change how grades within this unit are weighted.
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
