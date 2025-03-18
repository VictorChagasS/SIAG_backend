/**
 * Authenticate User Use Case
 *
 * This use case handles user authentication by validating credentials,
 * generating JWT tokens, and returning user information upon successful login.
 *
 * @module AuthUseCases
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IUserRepository } from '@/modules/users/domain/repositories/user-repository.interface';

import { IJwtPayload } from '../types/jwt-payload.type';

/**
 * Data Transfer Object for user authentication
 *
 * Contains the credentials needed for user authentication
 *
 * @interface IAuthenticateUserDTO
 */
export interface IAuthenticateUserDTO {
  /** User's email address */
  email: string;

  /** User's password (plain text) */
  password: string;
}

/**
 * Response structure after successful authentication
 *
 * Contains the JWT token and basic user information
 *
 * @interface IAuthResponse
 */
export interface IAuthResponse {
  /** JWT access token for subsequent authenticated requests */
  accessToken: string;

  /** Basic user information (excluding sensitive data) */
  user: {
    /** User ID */
    id: string;

    /** User's full name */
    name: string;

    /** User's email address */
    email: string;

    /** Flag indicating if user has admin privileges */
    isAdmin: boolean;
  };
}

/**
 * Use case for authenticating users
 *
 * Handles the authentication logic, including credential validation,
 * password comparison, and JWT token generation.
 *
 * @class AuthenticateUserUseCase
 */
@Injectable()
export class AuthenticateUserUseCase {
  /**
   * Creates an instance of AuthenticateUserUseCase
   *
   * @param {IUserRepository} userRepository - Repository for user data access
   * @param {JwtService} jwtService - Service for JWT token operations
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Executes the authentication process
   *
   * Validates user credentials, compares the password using bcrypt,
   * and generates a JWT token upon successful authentication.
   *
   * @param {IAuthenticateUserDTO} data - User credentials for authentication
   * @returns {Promise<IAuthResponse>} Authentication response with token and user data
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async execute(data: IAuthenticateUserDTO): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        title: 'Credenciais inválidas',
        detail: ['Email ou senha incorretos'],
      });
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        title: 'Credenciais inválidas',
        detail: ['Email ou senha incorretos'],
      });
    }

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }
}
