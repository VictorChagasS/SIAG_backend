/**
 * Upsert Unit With Utils DTO
 *
 * Data Transfer Object for creating or updating units within a class.
 * Uses custom validation utilities instead of direct class-validator decorators.
 *
 * @module UnitDTOs
 */
import { IsOptionalFormula, IsValidName } from '../utils/validators';

/**
 * DTO for handling unit upsert requests with custom validators
 *
 * Contains the same fields as UpsertUnitDto but uses custom validator decorators
 * from the utils folder for more specialized validation logic.
 *
 * @class UpsertUnitWithUtilsDto
 */
export class UpsertUnitWithUtilsDto {
  /**
   * Name of the unit
   *
   * Required field validated with custom IsValidName decorator
   */
  @IsValidName()
    name: string;

  /**
   * Custom formula for calculating the unit average
   *
   * Optional field validated with custom IsOptionalFormula decorator
   */
  @IsOptionalFormula()
    averageFormula?: string;
}
