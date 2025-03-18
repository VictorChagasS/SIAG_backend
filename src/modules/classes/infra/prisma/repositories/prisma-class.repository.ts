/**
 * Prisma Implementation of Class Repository
 *
 * This file contains the Prisma ORM implementation of the IClassRepository interface.
 * It handles data persistence and retrieval for class entities using Prisma.
 *
 * @module ClassRepositories
 */
import { Injectable } from '@nestjs/common';

import { IPaginatedResult, IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';
import { Class } from '@/modules/classes/domain/entities/class.entity';
import { IClassRepository } from '@/modules/classes/domain/repositories/class-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Prisma implementation of the Class Repository
 *
 * Implements all the methods defined in the IClassRepository interface
 * using Prisma ORM to interact with the database.
 *
 * @class PrismaClassRepository
 * @implements {IClassRepository}
 */
@Injectable()
export class PrismaClassRepository implements IClassRepository {
  /**
   * Creates an instance of PrismaClassRepository
   *
   * @param {PrismaService} prisma - The Prisma service for database access
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new class in the database
   *
   * @param {Class} classData - The class data to create
   * @returns {Promise<Class>} The created class with studentCount initialized to 0
   */
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

  /**
   * Finds a class by its ID
   *
   * @param {string} id - The class ID to search for
   * @returns {Promise<Class | null>} The class if found, null otherwise
   */
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

  /**
   * Finds all classes taught by a specific teacher with pagination and filtering
   *
   * @param {string} teacherId - The teacher ID to filter by
   * @param {IPaginationNamePeriodSearchOptions} [options] - Pagination and search options
   * @returns {Promise<IPaginatedResult<Class>>} Paginated result of classes
   */
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

  /**
   * Finds active classes (current period) taught by a specific teacher
   *
   * Retrieves the teacher's current period setting and filters classes accordingly
   *
   * @param {string} teacherId - The teacher ID to filter by
   * @param {string} [name] - Optional name filter
   * @returns {Promise<Class[]>} Array of active classes
   */
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

  /**
   * Finds all classes in the system
   *
   * @returns {Promise<Class[]>} Array of all classes
   */
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

  /**
   * Finds all active classes (current period) in the system
   *
   * Retrieves the current period from any admin user and filters classes accordingly
   *
   * @returns {Promise<Class[]>} Array of active classes
   */
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

  /**
   * Updates a class's information
   *
   * @param {string} id - The class ID to update
   * @param {Partial<Class>} classData - The data to update
   * @returns {Promise<Class>} The updated class
   */
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

  /**
   * Deletes a class from the database
   *
   * @param {string} id - The class ID to delete
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.prisma.class.delete({
      where: { id },
    });
  }

  /**
   * Finds a class by name and period
   *
   * @param {string} name - The class name
   * @param {string} period - The academic period
   * @returns {Promise<Class | null>} The class if found, null otherwise
   */
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

  /**
   * Finds a class by name, period, teacher and optionally section
   * Used to check if a class with these parameters already exists
   *
   * @param {string} name - The class name
   * @param {string} period - The academic period
   * @param {string} teacherId - The teacher ID
   * @param {number} [section] - Optional section number
   * @returns {Promise<Class | null>} The class if found, null otherwise
   */
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
