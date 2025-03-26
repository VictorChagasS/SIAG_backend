/**
 * JWT Payload Interface
 *
 * Defines the structure of the data encoded within the JWT token.
 * This payload contains essential user information and token metadata.
 *
 * @module AuthTypes
 */

/**
 * Interface for JWT payload structure
 *
 * Represents the data encoded in the JWT token. This includes user
 * identification, authorization information, and token metadata.
 *
 * @interface IJwtPayload
 */
export interface IJwtPayload {
  /**
   * Subject identifier (user ID)
   * Identifies the user this token belongs to
   */
  sub: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Flag indicating whether the user has admin privileges
   */
  isAdmin: boolean;

  /**
   * Issued at timestamp (automatically added by JWT)
   * Unix timestamp representing when the token was created
   */
  iat?: number;

  /**
   * Expiration timestamp (automatically added by JWT)
   * Unix timestamp representing when the token expires
   */
  exp?: number;
}
