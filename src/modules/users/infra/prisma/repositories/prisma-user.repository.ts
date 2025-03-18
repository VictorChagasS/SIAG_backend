import { Injectable } from '@nestjs/common';

import { User } from '@/modules/users/domain/entities/user.entity';
import { IUserRepository, IUserSearchOptions } from '@/modules/users/domain/repositories/user-repository.interface';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Prisma implementation of the User Repository
 * Handles database operations for users using Prisma ORM
 *
 * @class PrismaUserRepository
 * @implements {IUserRepository}
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new user in the database
   *
   * @param {User} user - The user data to create
   * @returns {Promise<User>} The created user
   */
  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
        institutionId: user.institutionId,
      },
      include: {
        institution: true,
      },
    });

    return this.mapToEntity(createdUser);
  }

  /**
   * Finds a user by email
   *
   * @param {string} email - The email to search for
   * @returns {Promise<User | null>} The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        institution: true,
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  /**
   * Finds a user by ID
   *
   * @param {string} id - The user ID
   * @returns {Promise<User | null>} The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        institution: true,
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  /**
   * Updates a user's information
   *
   * @param {string} id - The user ID to update
   * @param {Partial<User>} userData - The data to update
   * @returns {Promise<User>} The updated user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: userData,
      include: {
        institution: true,
      },
    });

    return this.mapToEntity(updatedUser);
  }

  /**
   * Deletes a user from the database
   *
   * @param {string} id - The user ID to delete
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Finds all users with optional search filtering
   * This method enables searching users by either name or email
   *
   * @param {IUserSearchOptions} [options] - Optional search parameters
   * @returns {Promise<User[]>} Array of users matching the criteria
   */
  async findAll(options?: IUserSearchOptions): Promise<User[]> {
    const { search } = options || {};

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        institution: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((user) => this.mapToEntity(user));
  }

  private mapToEntity(prismaUser: any): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      password: prismaUser.password,
      isAdmin: prismaUser.isAdmin,
      institutionId: prismaUser.institutionId,
      currentPeriod: prismaUser.currentPeriod,
    });
  }
}
