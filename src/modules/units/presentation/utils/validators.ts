/**
 * Custom Validator Decorators
 *
 * A collection of custom validation decorator functions for units module DTOs.
 * These decorators compose multiple class-validator decorators for cleaner validation code.
 *
 * @module UnitValidators
 */
import {
  IsNotEmpty, IsOptional, IsString, ValidationOptions,
} from 'class-validator';

/**
 * Validates that a property is a non-empty string
 *
 * Combines IsNotEmpty and IsString validators into a single decorator
 * for validating required name fields.
 *
 * @param {ValidationOptions} validationOptions - Optional validation configuration
 * @returns {PropertyDecorator} A composed property decorator
 */
export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsNotEmpty({ message: 'O nome é obrigatório', ...validationOptions })(object, propertyName);
    IsString({ message: 'O nome deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

/**
 * Validates that a property is a non-empty string for formula fields
 *
 * Combines IsNotEmpty and IsString validators into a single decorator
 * with formula-specific error messages.
 *
 * @param {ValidationOptions} validationOptions - Optional validation configuration
 * @returns {PropertyDecorator} A composed property decorator
 */
export function IsValidFormula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsNotEmpty({ message: 'A fórmula é obrigatória', ...validationOptions })(object, propertyName);
    IsString({ message: 'A fórmula deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

/**
 * Validates that a property is either undefined or a string for optional formula fields
 *
 * Combines IsOptional and IsString validators into a single decorator
 * with formula-specific error messages.
 *
 * @param {ValidationOptions} validationOptions - Optional validation configuration
 * @returns {PropertyDecorator} A composed property decorator
 */
export function IsOptionalFormula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'A fórmula deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

/**
 * Validates that a property is either undefined or a string for optional ID fields
 *
 * Combines IsOptional and IsString validators into a single decorator
 * with ID-specific error messages.
 *
 * @param {ValidationOptions} validationOptions - Optional validation configuration
 * @returns {PropertyDecorator} A composed property decorator
 */
export function IsOptionalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'O ID deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

/**
 * Validates that a property is either undefined or a string for optional name fields
 *
 * Combines IsOptional and IsString validators into a single decorator
 * with name-specific error messages.
 *
 * @param {ValidationOptions} validationOptions - Optional validation configuration
 * @returns {PropertyDecorator} A composed property decorator
 */
export function IsOptionalName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'O nome deve ser uma string', ...validationOptions })(object, propertyName);
  };
}
