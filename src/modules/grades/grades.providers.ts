/**
 * Providers for the Grades Module
 *
 * This file defines the providers for the Grades module that are
 * injected into the NestJS container to handle grade data persistence.
 *
 * @module GradesProviders
 * @grades Injection
 */

/**
 * Injection token for the Grade Repository
 * Used to identify the repository implementation in the dependency injection system
 *
 * @grades Token
 */
export const GRADE_REPOSITORY = 'GRADE_REPOSITORY';
