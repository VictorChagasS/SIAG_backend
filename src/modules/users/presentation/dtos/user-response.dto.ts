/**
 * User Response DTO
 *
 * Data Transfer Object for user data returned in API responses.
 * Contains all user information that should be exposed through the API.
 *
 * @module UserDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO representing a user in API responses
 *
 * Contains all necessary user information formatted for API consumers,
 * including core user data and metadata like timestamps.
 *
 * @class UserResponseDto
 */
export class UserResponseDto {
  /**
   * Unique identifier for the user
   */
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
    id: string;

  /**
   * Full name of the user
   */
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
    name: string;

  /**
   * Email address of the user
   * Used for login and notifications
   */
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
    email: string;

  /**
   * Administrative privileges flag
   * Determines user access level in the system
   */
  @ApiProperty({
    description: 'Whether the user is an administrator',
    example: false,
  })
    isAdmin: boolean;

  /**
   * Timestamp when the user account was created
   */
  @ApiProperty({
    description: 'When the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
    createdAt: Date;

  /**
   * Timestamp when the user account was last updated
   */
  @ApiProperty({
    description: 'When the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
    updatedAt: Date;
}
