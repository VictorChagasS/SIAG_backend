/**
 * Update User DTO
 *
 * Data Transfer Object for updating an existing user.
 * Contains validation rules for ensuring data integrity when updating users.
 * All fields are optional since updates can be partial.
 *
 * @module UserDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsEmail, IsOptional, IsString, MinLength,
} from 'class-validator';

/**
 * DTO for handling user update requests
 *
 * Contains the optional data to update an existing user with
 * appropriate validation rules for each field.
 *
 * @class UpdateUserDto
 */
export class UpdateUserDto {
  /**
   * Updated full name of the user
   * Optional field, must be a string if provided
   */
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
    name?: string;

  /**
   * Updated email address of the user
   * Optional field, must be a valid email format if provided
   */
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
    email?: string;

  /**
   * Updated password for the user account
   * Optional field, must be at least 6 characters if provided
   */
  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'password123',
    required: false,
    minLength: 6,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
    password?: string;

  /**
   * Updated administrative privileges flag
   * Optional field, determines user access level in the system
   */
  @ApiProperty({
    description: 'Se o usuário é um administrador',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
    isAdmin?: boolean;
}
