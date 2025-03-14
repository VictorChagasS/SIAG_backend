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
      },
    });

    return {
      ...createdClass,
    };
  }

  async findById(id: string): Promise<Class | null> {
    const classFound = await this.prisma.class.findUnique({
      where: { id },
    });

    if (!classFound) return null;

    return {
      ...classFound,
    };
  }

  async findByTeacherId(teacherId: string): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      where: { teacherId },
    });

    return classes.map((classItem) => ({
      ...classItem,
    }));
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
    });

    return classes.map((classItem) => ({
      ...classItem,
    }));
  }

  async findAll(): Promise<Class[]> {
    const classes = await this.prisma.class.findMany();

    return classes.map((classItem) => ({
      ...classItem,
    }));
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
    });

    return classes.map((classItem) => ({
      ...classItem,
    }));
  }

  async update(id: string, classData: Partial<Class>): Promise<Class> {
    const { teacherId, ...updateData } = classData;

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updatedClass,
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
    });

    if (!classFound) return null;

    return {
      ...classFound,
    };
  }

  async findByNamePeriodAndTeacher(name: string, period: string, teacherId: string): Promise<Class | null> {
    const classFound = await this.prisma.class.findFirst({
      where: {
        name,
        period,
        teacherId,
      },
    });

    if (!classFound) return null;

    return {
      ...classFound,
    };
  }
}
