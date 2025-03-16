import { Injectable } from '@nestjs/common';

import { EvaluationItem } from '@/modules/evaluation-items/domain/entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaEvaluationItemRepository implements IEvaluationItemRepository {
  constructor(private prisma: PrismaService) {}

  async create(evaluationItemData: EvaluationItem): Promise<EvaluationItem> {
    const createdEvaluationItem = await this.prisma.evaluationItem.create({
      data: {
        name: evaluationItemData.name,
        unitId: evaluationItemData.unitId,
      },
    });

    return createdEvaluationItem;
  }

  async findById(id: string): Promise<EvaluationItem | null> {
    const evaluationItem = await this.prisma.evaluationItem.findUnique({
      where: { id },
    });

    if (!evaluationItem) return null;

    return evaluationItem;
  }

  async findByUnitId(unitId: string): Promise<EvaluationItem[]> {
    const evaluationItems = await this.prisma.evaluationItem.findMany({
      where: { unitId },
      orderBy: { createdAt: 'asc' },
    });

    return evaluationItems;
  }

  async findByNameAndUnitId(name: string, unitId: string): Promise<EvaluationItem | null> {
    const evaluationItem = await this.prisma.evaluationItem.findFirst({
      where: {
        name,
        unitId,
      },
    });

    if (!evaluationItem) return null;

    return evaluationItem;
  }

  async update(id: string, evaluationItemData: Partial<EvaluationItem>): Promise<EvaluationItem> {
    const updatedEvaluationItem = await this.prisma.evaluationItem.update({
      where: { id },
      data: evaluationItemData,
    });

    return updatedEvaluationItem;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evaluationItem.delete({
      where: { id },
    });
  }
}
