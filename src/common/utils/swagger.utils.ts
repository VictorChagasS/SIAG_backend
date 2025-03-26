/**
 * Swagger Utilities
 *
 * Helper functions for configuring Swagger/OpenAPI documentation
 * with standardized response formats and proper schema references.
 *
 * @module CommonUtils
 */
import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath,
} from '@nestjs/swagger';

import { ApiErrorDto } from '../dtos/api-error.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';

/**
 * Creates a decorator for documenting standardized successful responses
 *
 * Wraps the response model in the standard API response format
 * with proper Swagger schema references.
 *
 * @param {Type<any>} model - The response data model type
 * @param {boolean} isArray - Whether the response contains an array of models
 * @returns {PropertyDecorator} A composed decorator for the controller method
 * @example
 * ```typescript
 * @Get()
 * @ApiResponseWrapped(UserDto)
 * getUser() {
 *   // ...
 * }
 * ```
 */
export function ApiResponseWrapped<T extends Type<any>>(model: T, isArray = false) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model, ApiErrorDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              result: isArray
                ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                }
                : {
                  $ref: getSchemaPath(model),
                },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Creates a decorator for documenting standardized error responses
 *
 * Configures the Swagger documentation for error responses
 * with proper schema references and examples.
 *
 * @param {number} status - HTTP status code for the error
 * @param {string} description - Human-readable description of the error
 * @param {string} [code] - Optional error code to show in the example
 * @param {string} [title] - Optional error title to show in the example
 * @returns {PropertyDecorator} A decorator for the controller method
 * @example
 * ```typescript
 * @Post()
 * @ApiErrorResponse(400, 'Invalid input data', 'VALIDATION_ERROR', 'Validation failed')
 * createUser() {
 *   // ...
 * }
 * ```
 */
export function ApiErrorResponse(status: number, description: string, code: string = '', title: string = '') {
  return ApiResponse({
    status,
    description,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiErrorDto) },
        {
          properties: {
            errors: {
              example: [
                {
                  code: code || 'ERROR_CODE',
                  title: title || 'Título do erro',
                  detail: ['Detalhes do erro'],
                },
              ],
            },
          },
        },
      ],
    },
  });
}
