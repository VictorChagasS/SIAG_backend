import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export interface IPaginationParams {
  page: number;
  limit: number;
  search?: string;
}

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
      limit: Math.min(Math.max(1, limit), 100),
      search,
    };
  },
);
