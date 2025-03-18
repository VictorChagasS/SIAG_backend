import { User } from '../entities/user.entity';

/**
 * Interface for search options when querying users
 *
 * @interface IUserSearchOptions
 * @property {string} [search] - Search term to filter users by name or email
 */
export interface IUserSearchOptions {
  /**
   * Search term to filter users by name or email
   */
  search?: string;
}

/**
 * Repository interface for user-related database operations
 *
 * @interface IUserRepository
 */
export interface IUserRepository {
  /**
   * Creates a new user in the database
   *
   * @param {User} user - The user data to create
   * @returns {Promise<User>} The created user
   */
  create(user: User): Promise<User>;

  /**
   * Finds a user by email
   *
   * @param {string} email - The email to search for
   * @returns {Promise<User | null>} The user if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by ID
   *
   * @param {string} id - The user ID
   * @returns {Promise<User | null>} The user if found, null otherwise
   */
  findById(id: string): Promise<User | null>;

  /**
   * Updates a user's information
   *
   * @param {string} id - The user ID to update
   * @param {Partial<User>} user - The data to update
   * @returns {Promise<User>} The updated user
   */
  update(id: string, user: Partial<User>): Promise<User>;

  /**
   * Deletes a user from the database
   *
   * @param {string} id - The user ID to delete
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void>;

  /**
   * Finds all users with optional search filtering
   *
   * @param {IUserSearchOptions} [options] - Optional search parameters
   * @returns {Promise<User[]>} Array of users matching the criteria
   */
  findAll(options?: IUserSearchOptions): Promise<User[]>;
}
