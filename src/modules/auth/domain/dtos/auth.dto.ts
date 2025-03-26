/**
 * Authentication DTO
 *
 * Data Transfer Object for authentication requests.
 * Contains the necessary fields for user login.
 *
 * @module AuthDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsString, MinLength,
} from 'class-validator';

/**
 * DTO for handling authentication requests
 *
 * Contains the user credentials needed for authentication.
 * Includes validation rules for ensuring data integrity.
 *
 * @class AuthDto
 */
export class AuthDto {
  /**
   * User's email address
   *
   * Must be a valid email format
   */
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
    email: string;

  /**
   * User's password
   *
   * Must be at least 6 characters long
   */
  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
    password: string;
}
