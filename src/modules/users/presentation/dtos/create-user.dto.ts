/**
 * Create User DTO
 *
 * Data Transfer Object for creating a new user.
 * Contains validation rules for ensuring data integrity when creating users.
 *
 * @module UserDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength,
} from 'class-validator';

/**
 * DTO for handling user creation requests
 *
 * Contains the required data to create a new user with
 * appropriate validation rules for each field.
 *
 * @class CreateUserDto
 */
export class CreateUserDto {
  /**
   * Full name of the user
   * Required field, must be a non-empty string
   */
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
    name: string;

  /**
   * Email address of the user
   * Required field, must be a valid email format
   */
  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  /**
   * Password for the user account
   * Required field, must be at least 6 characters
   */
  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
    password: string;

  /**
   * Administrative privileges flag
   * Optional field, defaults to false if not provided
   */
  @ApiProperty({
    description: 'Se o usuário é um administrador',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
    isAdmin?: boolean;

  /**
   * ID of the institution the user belongs to
   * Required field, must be a non-empty string
   */
  @ApiProperty({
    description: 'ID da instituição a qual o usuário pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
    institutionId: string;
}
