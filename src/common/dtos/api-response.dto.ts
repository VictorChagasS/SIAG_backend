/**
 * API Response DTO
 *
 * Generic DTO for standardized API responses across the application.
 * Provides a consistent format with a message and typed result data.
 *
 * @module CommonDTOs
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Generic DTO for API responses
 *
 * A type-safe generic response format for API operations.
 * Includes a success message and properly typed result data.
 *
 * @class ApiResponseDto
 * @template T The type of the result data
 */
export class ApiResponseDto<T> {
  /**
   * Success message for the operation
   */
  @ApiProperty({
    description: 'Mensagem de sucesso da operação',
    example: 'Operação realizada com sucesso',
  })
    message: string;

  /**
   * Data returned by the operation
   */
  @ApiProperty({
    description: 'Dados retornados pela operação',
  })
  @Type((options) => (options?.newObject as any)?.resultType)
    result: T;

  /**
   * Creates an instance of ApiResponseDto
   *
   * @param partial Optional partial object to initialize properties
   */
  constructor(partial?: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
