import { Injectable } from '@nestjs/common';

import { Unit } from '@/modules/units/domain/entities/unit.entity';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaUnitRepository implements IUnitRepository {
  constructor(private prisma: PrismaService) {}

  async create(unitData: Unit): Promise<Unit> {
    const createdUnit = await this.prisma.unit.create({
      data: {
        name: unitData.name,
        classId: unitData.classId,
        averageFormula: unitData.averageFormula,
      },
    });

    return createdUnit;
  }

  async findById(id: string): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) return null;

    return unit;
  }

  async findByClassId(classId: string): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' },
    });

    return units;
  }

  async findByNameAndClassId(name: string, classId: string): Promise<Unit | null> {
    const unit = await this.prisma.unit.findFirst({
      where: {
        name,
        classId,
      },
    });

    if (!unit) return null;

    return unit;
  }

  async update(id: string, unitData: Partial<Unit>): Promise<Unit> {
    const updatedUnit = await this.prisma.unit.update({
      where: { id },
      data: unitData,
    });

    return updatedUnit;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({
      where: { id },
    });
  }
}
