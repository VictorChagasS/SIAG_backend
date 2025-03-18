import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

import { Pagination, IPaginationParams } from '@/common/decorators/pagination.decorator';
import { ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { PrismaService } from '@/prisma/prisma.service';

import { InstitutionsSearchResponseDto } from './dtos/institutions-search-response.dto';
import { PaginatedInstitutionsResponseDto } from './dtos/paginated-institutions-response.dto';

@ApiTags('institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar instituições',
    description: 'Lista todas as instituições com suporte a paginação e busca',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número da página',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limite de registros por página',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    description: 'Termo para busca por nome ou sigla',
    required: false,
    type: String,
    example: 'UFPB',
  })
  @ApiResponseWrapped(PaginatedInstitutionsResponseDto)
  async findAll(
  @Pagination() { page, limit, search }: IPaginationParams,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.InstitutionWhereInput = search
      ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            acronym: {
              equals: search,
              mode: 'insensitive',
            },
          },
        ],
      }
      : {};

    const [total, universities] = await Promise.all([
      this.prisma.institution.count({
        where,
      }),
      this.prisma.institution.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      items: universities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar instituições',
    description: 'Busca rápida de instituições pelo nome ou sigla (limitado a 10 resultados)',
  })
  @ApiQuery({
    name: 'search',
    description: 'Termo para busca por nome ou sigla',
    required: false,
    type: String,
    example: 'UFPB',
  })
  @ApiResponseWrapped(InstitutionsSearchResponseDto)
  async search(@Pagination() { search }: IPaginationParams) {
    if (!search) {
      return { items: [] };
    }

    const universities = await this.prisma.institution.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            acronym: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      items: universities,
    };
  }
}
