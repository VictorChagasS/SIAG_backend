/**
 * Authentication Response DTOs
 *
 * Data Transfer Objects for the authentication response structure.
 * Used for standardizing and documenting API responses.
 *
 * @module AuthDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * User information included in authentication responses
 *
 * Contains basic user data returned after successful authentication,
 * excluding sensitive information.
 *
 * @class UserDto
 */
class UserDto {
  /**
   * User's unique identifier
   */
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  /**
   * User's full name
   */
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
    name: string;

  /**
   * User's email address
   */
  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
    email: string;

  /**
   * Flag indicating if the user has admin privileges
   */
  @ApiProperty({
    description: 'Indica se o usuário é administrador',
    example: false,
  })
    isAdmin: boolean;
}

/**
 * Authentication response structure
 *
 * Represents the complete response returned after successful authentication,
 * including the JWT token and user information.
 *
 * @class AuthResponseDto
 */
export class AuthResponseDto {
  /**
   * JWT access token for authenticated requests
   */
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
    accessToken: string;

  /**
   * User data included in the response
   */
  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: UserDto,
  })
    user: UserDto;
}
