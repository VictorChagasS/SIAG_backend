import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../users.providers';
import { User } from '../entities/user.entity';
import { IUserRepository, IUserSearchOptions } from '../repositories/user-repository.interface';

/**
 * Parameters for listing users with optional search
 *
 * @interface IListUsersParams
 * @property {string} [search] - Optional search term to filter users by name or email
 */
export interface IListUsersParams {
  /** Optional search term to filter users by name or email */
  search?: string;
}

/**
 * Use case for listing users with optional search filtering
 *
 * @class ListUsersUseCase
 */
@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Executes the use case to list users with optional filtering
   *
   * Retrieves all users from the database with optional filtering by name or email.
   *
   * @param {IListUsersParams} [params] - Parameters for filtering users
   * @returns {Promise<User[]>} Array of users matching the criteria
   */
  async execute(params?: IListUsersParams): Promise<User[]> {
    const options: IUserSearchOptions = {
      search: params?.search,
    };

    return this.userRepository.findAll(options);
  }
}
