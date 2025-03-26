/**
 * Providers for the Students Module
 *
 * This file defines the providers for the Students module that are
 * injected into the NestJS container to handle student data persistence.
 *
 * @module StudentsProviders
 * @students Injection
 */

/**
 * Injection token for the Student Repository
 * Used to identify the repository implementation in the dependency injection system
 *
 * @students Token
 */
export const STUDENT_REPOSITORY = 'STUDENT_REPOSITORY';
