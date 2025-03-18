import { Injectable } from '@nestjs/common';

import { IPaginatedResult, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';
import { Class } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaClassRepository implements IClassRepository {
  constructor(private prisma: PrismaService) {}

  async create(classData: Class): Promise<Class> {
    const createdClass = await this.prisma.class.create({
      data: {
        name: classData.name,
        period: classData.period,
        teacherId: classData.teacherId,
        code: classData?.code,
        section: classData?.section || 1,
      },
    });

    return {
      ...createdClass,
      studentCount: 0,
    };
  }

  async findById(id: string): Promise<Class | null> {
    const classFound = await this.prisma.class.findUnique({
      where: { id },
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classFound) return null;

    // eslint-disable-next-line no-underscore-dangle
    const { _count, ...classData } = classFound;

    return {
      ...classData,
      // eslint-disable-next-line no-underscore-dangle
      studentCount: _count.students,
    };
  }

  async findByTeacherId(
    teacherId: string,
    options?: IPaginationNamePeriodSearchOptions,
  ): Promise<IPaginatedResult<Class>> {
    const {
      page = 1, limit = 10, name, period,
    } = options || {};
    const skip = (page - 1) * limit;

    const whereClause: any = { teacherId };

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (period) {
      whereClause.period = period;
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where: whereClause,
        include: {
          // eslint-disable-next-line no-underscore-dangle
          _count: {
            select: { students: true },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.class.count({
        where: whereClause,
      }),
    ]);

    const data = classes.map((classItem) => {
      // eslint-disable-next-line no-underscore-dangle
      const { _count, ...classData } = classItem;
      return {
        ...classData,
        // eslint-disable-next-line no-underscore-dangle
        studentCount: _count.students,
      };
    });

    return {
      data,
      total,
    };
  }

  async findActiveByTeacherId(teacherId: string, name?: string): Promise<Class[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { currentPeriod: true },
    });

    const whereClause: any = {
      teacherId,
      period: user?.currentPeriod,
    };

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const classes = await this.prisma.class.findMany({
      where: whereClause,
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    return classes.map((classItem) => {
      // eslint-disable-next-line no-underscore-dangle
      const { _count, ...classData } = classItem;
      return {
        ...classData,
        // eslint-disable-next-line no-underscore-dangle
        studentCount: _count.students,
      };
    });
  }

  async findAll(): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    return classes.map((classItem) => {
      // eslint-disable-next-line no-underscore-dangle
      const { _count, ...classData } = classItem;
      return {
        ...classData,
        // eslint-disable-next-line no-underscore-dangle
        studentCount: _count.students,
      };
    });
  }

  async findAllActive(): Promise<Class[]> {
    const admin = await this.prisma.user.findFirst({
      where: { isAdmin: true },
      select: { currentPeriod: true },
    });

    const classes = await this.prisma.class.findMany({
      where: {
        period: admin?.currentPeriod,
      },
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    return classes.map((classItem) => {
      // eslint-disable-next-line no-underscore-dangle
      const { _count, ...classData } = classItem;
      return {
        ...classData,
        // eslint-disable-next-line no-underscore-dangle
        studentCount: _count.students,
      };
    });
  }

  async update(id: string, classData: Partial<Class>): Promise<Class> {
    const { teacherId, studentCount, ...updateData } = classData;

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    // eslint-disable-next-line no-underscore-dangle
    const { _count, ...updatedClassData } = updatedClass;

    return {
      ...updatedClassData,
      // eslint-disable-next-line no-underscore-dangle
      studentCount: _count.students,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.class.delete({
      where: { id },
    });
  }

  async findByNameAndPeriod(name: string, period: string): Promise<Class | null> {
    const classFound = await this.prisma.class.findFirst({
      where: {
        name,
        period,
      },
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classFound) return null;

    // eslint-disable-next-line no-underscore-dangle
    const { _count, ...classData } = classFound;

    return {
      ...classData,
      // eslint-disable-next-line no-underscore-dangle
      studentCount: _count.students,
    };
  }

  async findByNamePeriodAndTeacher(name: string, period: string, teacherId: string, section: number): Promise<Class | null> {
    const classFound = await this.prisma.class.findFirst({
      where: {
        name,
        period,
        teacherId,
        section,
      },
      include: {
        // eslint-disable-next-line no-underscore-dangle
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classFound) return null;

    // eslint-disable-next-line no-underscore-dangle
    const { _count, ...classData } = classFound;

    return {
      ...classData,
      // eslint-disable-next-line no-underscore-dangle
      studentCount: _count.students,
    };
  }
}
