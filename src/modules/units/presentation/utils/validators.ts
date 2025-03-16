import {
  IsNotEmpty, IsOptional, IsString, ValidationOptions,
} from 'class-validator';

// Decoradores para validação de nome
export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsNotEmpty({ message: 'O nome é obrigatório', ...validationOptions })(object, propertyName);
    IsString({ message: 'O nome deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

// Decoradores para validação de fórmula
export function IsValidFormula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsNotEmpty({ message: 'A fórmula é obrigatória', ...validationOptions })(object, propertyName);
    IsString({ message: 'A fórmula deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

// Decoradores para validação de fórmula opcional
export function IsOptionalFormula(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'A fórmula deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

// Decoradores para validação de ID opcional
export function IsOptionalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'O ID deve ser uma string', ...validationOptions })(object, propertyName);
  };
}

// Decoradores para validação de nome opcional
export function IsOptionalName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    IsOptional()(object, propertyName);
    IsString({ message: 'O nome deve ser uma string', ...validationOptions })(object, propertyName);
  };
}
