import {
  Controller,
  Get,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { Pagination, IPaginationParams } from '@/common/decorators/pagination.decorator';
import { PrismaService } from '@/prisma/prisma.service';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
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
          // {
          //   acronym: {
          //     contains: search,
          //     mode: Prisma.QueryMode.insensitive,
          //   },
          // },
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
