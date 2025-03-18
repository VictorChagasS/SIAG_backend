/**
 * User Me Response DTO
 *
 * Data Transfer Object for the current user's profile response.
 * Contains the complete user profile information returned by the /me endpoint.
 *
 * @module AuthDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user profile response
 *
 * Contains the complete user profile information, including
 * personal details and system metadata, excluding sensitive
 * information like passwords.
 *
 * @class UserMeResponseDto
 */
export class UserMeResponseDto {
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
    description: 'User email',
    example: 'john.smith@example.com',
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

  /**
   * User's current academic period
   * Can be null if not applicable or not set
   */
  @ApiProperty({
    description: 'Período atual do usuário',
    example: '2025.2',
    nullable: true,
  })
    currentPeriod: string | null;

  /**
   * ID of the user's associated institution
   */
  @ApiProperty({
    description: 'ID da instituição do usuário',
    example: '1234',
  })
    institutionId: string;

  /**
   * Timestamp of when the user account was created
   */
  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2023-01-01T00:00:00.000Z',
  })
    createdAt: Date;

  /**
   * Timestamp of when the user account was last updated
   */
  @ApiProperty({
    description: 'Data de atualização do usuário',
    example: '2023-01-01T00:00:00.000Z',
  })
    updatedAt: Date;
}
