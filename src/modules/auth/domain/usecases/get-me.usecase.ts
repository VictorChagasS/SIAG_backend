/**
 * Get Me Use Case
 *
 * This use case retrieves the profile information of the currently
 * authenticated user based on their JWT payload.
 *
 * @module AuthUseCases
 */
import { Injectable, NotFoundException } from '@nestjs/common';

import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

import { IJwtPayload } from '../types/jwt-payload.type';

/**
 * Use case for retrieving the current user's profile
 *
 * Fetches detailed user information based on the user ID from the JWT token.
 *
 * @class GetMeUseCase
 */
@Injectable()
export class GetMeUseCase {
  /**
   * Creates an instance of GetMeUseCase
   *
   * @param {IUserRepository} userRepository - Repository for user data access
   */
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the get me use case
   *
   * Retrieves the user's full profile information based on the JWT payload's subject,
   * excluding sensitive data like passwords before returning the result.
   *
   * @param {IJwtPayload} user - The JWT payload from the authenticated request
   * @returns {Promise<Object>} User profile data with password excluded
   * @throws {NotFoundException} If the user is not found in the database
   */
  async execute(user: IJwtPayload) {
    const userInfo = await this.userRepository.findById(user.sub);

    if (!userInfo) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        title: 'User not found',
        detail: ['The requested user was not found'],
      });
    }

    const { password, ...userRest } = userInfo;

    return userRest;
  }
}
