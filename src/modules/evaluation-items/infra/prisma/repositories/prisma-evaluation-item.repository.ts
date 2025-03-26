/**
 * Prisma Evaluation Item Repository
 *
 * Implementation of the Evaluation Item Repository interface using Prisma ORM
 * for database operations.
 *
 * @module EvaluationItemRepositories
 * @evaluation-items Infrastructure
 */
import { Injectable } from '@nestjs/common';

import { EvaluationItem } from '@/modules/evaluation-items/domain/entities/evaluation-item.entity';
import { IEvaluationItemRepository } from '@/modules/evaluation-items/domain/repositories/evaluation-item-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Prisma implementation of the Evaluation Item Repository
 *
 * Provides concrete implementations of all methods defined in the
 * IEvaluationItemRepository interface using Prisma ORM for database access.
 *
 * @class PrismaEvaluationItemRepository
 * @implements {IEvaluationItemRepository}
 * @evaluation-items Repository
 */
@Injectable()
export class PrismaEvaluationItemRepository implements IEvaluationItemRepository {
  /**
   * Creates a repository instance with Prisma service
   *
   * @param {PrismaService} prisma - Injected Prisma service
   * @evaluation-items Constructor
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new evaluation item in the database
   *
   * @param {EvaluationItem} evaluationItemData - The evaluation item data to create
   * @returns {Promise<EvaluationItem>} The created evaluation item with generated ID and timestamps
   * @evaluation-items Create
   */
  async create(evaluationItemData: EvaluationItem): Promise<EvaluationItem> {
    const createdEvaluationItem = await this.prisma.evaluationItem.create({
      data: {
        name: evaluationItemData.name,
        unitId: evaluationItemData.unitId,
        createdAt: evaluationItemData.createdAt,
      },
    });

    return createdEvaluationItem;
  }

  /**
   * Finds an evaluation item by its unique identifier
   *
   * @param {string} id - The evaluation item ID to search for
   * @returns {Promise<EvaluationItem | null>} The evaluation item if found, null otherwise
   * @evaluation-items Read
   */
  async findById(id: string): Promise<EvaluationItem | null> {
    const evaluationItem = await this.prisma.evaluationItem.findUnique({
      where: { id },
    });

    if (!evaluationItem) return null;

    return evaluationItem;
  }

  /**
   * Finds all evaluation items belonging to a specific unit
   *
   * @param {string} unitId - The unit ID to search evaluation items for
   * @returns {Promise<EvaluationItem[]>} Array of evaluation items for the unit
   * @evaluation-items Read
   */
  async findByUnitId(unitId: string): Promise<EvaluationItem[]> {
    const evaluationItems = await this.prisma.evaluationItem.findMany({
      where: { unitId },
      orderBy: { createdAt: 'asc' },
    });

    return evaluationItems;
  }

  /**
   * Finds an evaluation item by name within a specific unit
   *
   * @param {string} name - The evaluation item name to search for
   * @param {string} unitId - The unit ID to search within
   * @returns {Promise<EvaluationItem | null>} The evaluation item if found, null otherwise
   * @evaluation-items Read
   */
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

  /**
   * Updates an evaluation item's information
   *
   * @param {string} id - The evaluation item ID to update
   * @param {Partial<EvaluationItem>} evaluationItemData - The data to update
   * @returns {Promise<EvaluationItem>} The updated evaluation item
   * @evaluation-items Update
   */
  async update(id: string, evaluationItemData: Partial<EvaluationItem>): Promise<EvaluationItem> {
    const updatedEvaluationItem = await this.prisma.evaluationItem.update({
      where: { id },
      data: evaluationItemData,
    });

    return updatedEvaluationItem;
  }

  /**
   * Deletes an evaluation item from the database
   *
   * @param {string} id - The evaluation item ID to delete
   * @returns {Promise<void>}
   * @evaluation-items Delete
   */
  async delete(id: string): Promise<void> {
    await this.prisma.evaluationItem.delete({
      where: { id },
    });
  }
}
