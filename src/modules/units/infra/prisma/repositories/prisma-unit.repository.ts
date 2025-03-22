/**
 * Prisma Unit Repository
 *
 * Implementation of the Unit Repository interface using Prisma ORM
 * for database operations.
 *
 * @module UnitRepositories
 * @units Infrastructure
 */
import { Injectable } from '@nestjs/common';

import { Unit } from '@/modules/units/domain/entities/unit.entity';
import { IUnitRepository } from '@/modules/units/domain/repositories/unit-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Prisma implementation of the Unit Repository
 *
 * Provides concrete implementations of all methods defined in the
 * IUnitRepository interface using Prisma ORM for database access.
 *
 * @class PrismaUnitRepository
 * @implements {IUnitRepository}
 * @units Repository
 */
@Injectable()
export class PrismaUnitRepository implements IUnitRepository {
  /**
   * Creates a repository instance with Prisma service
   *
   * @param {PrismaService} prisma - Injected Prisma service
   * @units Constructor
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new unit in the database
   *
   * @param {Unit} unitData - The unit data to create
   * @returns {Promise<Unit>} The created unit with generated ID and timestamps
   * @units Create
   */
  async create(unitData: Unit): Promise<Unit> {
    const createdUnit = await this.prisma.unit.create({
      data: {
        name: unitData.name,
        classId: unitData.classId,
        averageFormula: unitData.averageFormula,
        createdAt: unitData.createdAt,
      },
    });

    return createdUnit;
  }

  /**
   * Finds a unit by its unique identifier
   *
   * @param {string} id - The unit ID to search for
   * @returns {Promise<Unit | null>} The unit if found, null otherwise
   * @units Read
   */
  async findById(id: string): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) return null;

    return unit;
  }

  /**
   * Finds all units belonging to a specific class
   *
   * @param {string} classId - The class ID to search units for
   * @returns {Promise<Unit[]>} Array of units for the class
   * @units Read
   */
  async findByClassId(classId: string): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' },
    });

    return units;
  }

  /**
   * Finds a unit by name within a specific class
   *
   * @param {string} name - The unit name to search for
   * @param {string} classId - The class ID to search within
   * @returns {Promise<Unit | null>} The unit if found, null otherwise
   * @units Read
   */
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

  /**
   * Updates a unit's information
   *
   * @param {string} id - The unit ID to update
   * @param {Partial<Unit>} unitData - The data to update
   * @returns {Promise<Unit>} The updated unit
   * @units Update
   */
  async update(id: string, unitData: Partial<Unit>): Promise<Unit> {
    const updatedUnit = await this.prisma.unit.update({
      where: { id },
      data: unitData,
    });

    return updatedUnit;
  }

  /**
   * Deletes a unit from the database
   *
   * @param {string} id - The unit ID to delete
   * @returns {Promise<void>}
   * @units Delete
   */
  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({
      where: { id },
    });
  }
}
