/**
 * Providers for the Classes Module
 *
 * This file defines the providers for the Classes module that are
 * injected into the NestJS container to handle class data persistence.
 *
 * @module ClassesProviders
 */
import { PrismaClassRepository } from '@/modules/classes/infra/prisma/repositories/prisma-class.repository';

/**
 * Injection token for the Class Repository
 * Used to identify the repository implementation in the dependency injection system
 */
export const CLASS_REPOSITORY = 'ClassRepository';

/**
 * Array of providers for the Classes module
 *
 * Contains the definition of how the repository will be instantiated
 * and injected into the NestJS container.
 */
export const classesProviders = [
  {
    provide: CLASS_REPOSITORY,
    useClass: PrismaClassRepository,
  },
];
