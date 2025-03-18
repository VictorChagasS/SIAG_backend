/**
 * API Error DTOs
 *
 * DTOs for standardized error responses across the application.
 * Provides consistent error information including error code, title, and details.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for detailed error information
 *
 * Contains specific information about an individual error,
 * including error code, title, and detailed messages.
 *
 * @class ErrorDetailDto
 */
class ErrorDetailDto {
  /**
   * Error code identifier
   *
   * A unique string code that identifies the type of error
   */
  @ApiProperty({
    description: 'Código do erro',
    example: 'INVALID_CREDENTIALS',
  })
    code: string;

  /**
   * Human-readable error title
   *
   * A short description of the error
   */
  @ApiProperty({
    description: 'Título do erro',
    example: 'Credenciais inválidas',
  })
    title: string;

  /**
   * Detailed error messages
   *
   * Array of specific error messages explaining the issue in detail
   */
  @ApiProperty({
    description: 'Detalhes do erro',
    example: ['Email ou senha incorretos'],
    type: [String],
  })
    detail: string[];
}

/**
 * Main DTO for API error responses
 *
 * Contains an array of error details to provide comprehensive
 * error information to API consumers.
 *
 * @class ApiErrorDto
 */
export class ApiErrorDto {
  /**
   * List of detailed errors
   *
   * Can contain multiple errors from a single operation
   */
  @ApiProperty({
    description: 'Lista de erros',
    type: [ErrorDetailDto],
  })
    errors: ErrorDetailDto[];
}
