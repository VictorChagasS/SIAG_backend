/**
 * Transform Interceptor
 *
 * An interceptor that transforms successful responses into
 * a standardized API response format with a success message
 * and the original data.
 *
 * This ensures consistent response structure across all API endpoints.
 *
 * @module CommonInterceptors
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponseDto } from '../dtos/api-response.dto';

/**
 * Response transformation interceptor
 *
 * Intercepts successful responses and wraps them in a standardized
 * API response format with a success message and result data.
 *
 * @class TransformInterceptor
 * @implements {NestInterceptor<T, ApiResponseDto<T>>}
 * @template T The type of the original response data
 */
@Injectable()
export class TransformInterceptor<T>
implements NestInterceptor<T, ApiResponseDto<T>> {
  /**
   * Intercepts and transforms the response
   *
   * Takes the original response data and wraps it in a standardized
   * API response format with a success message.
   *
   * @param {ExecutionContext} context - The execution context
   * @param {CallHandler} next - The call handler for the next middleware/interceptor
   * @returns {Observable<ApiResponseDto<T>>} The transformed response
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => ({
        message: 'Operação realizada com sucesso',
        result: data,
      })),
    );
  }
}
