import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath,
} from '@nestjs/swagger';

import { ApiErrorDto } from '../dtos/api-error.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';

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
