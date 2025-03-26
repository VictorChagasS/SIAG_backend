/**
 * Pagination Decorator
 *
 * A parameter decorator for extracting and validating pagination parameters
 * from HTTP requests. This decorator automatically handles pagination-related
 * query parameters and performs validation.
 *
 * @module CommonDecorators
 */
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Interface for pagination parameters
 *
 * Defines the structure of pagination parameters that will be
 * extracted from request query parameters.
 *
 * @interface IPaginationParams
 */
export interface IPaginationParams {
  /** Current page number (1-based) */
  page: number;

  /** Maximum number of items per page */
  limit: number;

  /** Optional search term for filtering results */
  search?: string;
}

/**
 * Pagination parameter decorator
 *
 * Extracts pagination parameters from request query parameters,
 * validates them, and applies sensible defaults and constraints.
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Pagination() pagination: IPaginationParams) {
 *   return this.service.findAll(pagination);
 * }
 * ```
 *
 * @throws {BadRequestException} If pagination parameters are invalid
 * @returns {IPaginationParams} The validated pagination parameters
 */
export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IPaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;
    const { search } = request.query;

    if (page < 1 || limit < 1) {
      throw new BadRequestException({
        code: 'INVALID_PAGINATION',
        title: 'Parâmetros de paginação inválidos',
        detail: ['Page e limit devem ser maiores que 0'],
      });
    }

    return {
      page: Math.max(1, page),
      limit: Math.min(Math.max(1, limit), 100), // Constrain limit to 1-100
      search,
    };
  },
);
