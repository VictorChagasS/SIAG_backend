import { Injectable } from '@nestjs/common';

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

  async findByTeacherId(teacherId: string): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      where: { teacherId },
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

  async findActiveByTeacherId(teacherId: string): Promise<Class[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { currentPeriod: true },
    });

    const classes = await this.prisma.class.findMany({
      where: {
        teacherId,
        period: user?.currentPeriod,
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
