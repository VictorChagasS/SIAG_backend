import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { AdminGuard } from '@/modules/auth/domain/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';
import { CreateUserUseCase } from '@/modules/users/domain/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/modules/users/domain/usecases/delete-user.usecase';
import { GetUserProfileUseCase } from '@/modules/users/domain/usecases/get-user-profile.usecase';
import { ListUsersUseCase } from '@/modules/users/domain/usecases/list-users.usecase';
import { CreateUserDto } from '@/modules/users/presentation/dtos/create-user.dto';
import { UpdateUserDto } from '@/modules/users/presentation/dtos/update-user.dto';
import { UserSearchQueryDto } from '@/modules/users/presentation/dtos/user-search-query.dto';

import { UpdateUserUseCase } from '../../domain/usecases/update-user.usecase';
import { UserResponseDto } from '../dtos/user-response.dto';

/**
 * Controller for handling user-related HTTP requests
 *
 * @class UsersController
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * Create a new user
   *
   * @param {CreateUserDto} createUserDto - The user data to create
   * @returns {Promise<Object>} The created user data
   */
  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Creates a new user' })
  @ApiResponseWrapped(UserResponseDto)
  @ApiErrorResponse(400, 'Invalid data', 'INVALID_DATA', 'Invalid data')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      isAdmin: createUserDto.isAdmin,
      institutionId: createUserDto.institutionId,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get the profile of the authenticated user
   *
   * @param {IJwtPayload} user - The authenticated user data
   * @returns {Promise<Object>} The user profile data
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get profile', description: 'Gets the profile of the authenticated user' })
  @ApiResponseWrapped(UserResponseDto)
  @ApiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED', 'Unauthorized')
  async getProfile(@CurrentUser() user: IJwtPayload) {
    const profile = await this.getUserProfileUseCase.execute(user.sub);

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      isAdmin: profile.isAdmin,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * List all users with optional search filtering
   *
   * @param {UserSearchQueryDto} query - The search query parameters
   * @returns {Promise<Object[]>} Array of users matching the criteria
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'List users',
    description: 'Lists all users with optional search filtering by name or email (admin only)',
  })
  @ApiResponseWrapped(UserResponseDto, true)
  @ApiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED', 'Unauthorized')
  @ApiErrorResponse(403, 'Forbidden', 'FORBIDDEN', 'Forbidden')
  async listAll(@Query() query: UserSearchQueryDto) {
    const users = await this.listUsersUseCase.execute(query);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  /**
   * Update user data
   *
   * @param {string} id - The user ID to update
   * @param {UpdateUserDto} updateUserDto - The data to update
   * @returns {Promise<Object>} Object containing before and after states
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update user', description: 'Updates a user by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponseWrapped(UserResponseDto)
  @ApiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED', 'Unauthorized')
  @ApiErrorResponse(403, 'Forbidden', 'FORBIDDEN', 'Forbidden')
  @ApiErrorResponse(404, 'User not found', 'NOT_FOUND', 'User not found')
  async update(
  @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { before, after } = await this.updateUserUseCase.execute(id, updateUserDto);

    return {
      message: 'Usuário atualizado com sucesso',
      data: {
        before: {
          id: before.id,
          name: before.name,
          email: before.email,
          isAdmin: before.isAdmin,
          currentPeriod: before.currentPeriod,
          institutionId: before.institutionId,
          createdAt: before.createdAt,
          updatedAt: before.updatedAt,
        },
        after: {
          id: after.id,
          name: after.name,
          email: after.email,
          isAdmin: after.isAdmin,
          currentPeriod: after.currentPeriod,
          institutionId: after.institutionId,
          createdAt: after.createdAt,
          updatedAt: after.updatedAt,
        },
      },
    };
  }

  /**
   * Delete a user
   *
   * @param {string} id - The user ID to delete
   * @param {IJwtPayload} currentUser - The authenticated user data
   * @returns {Promise<Object>} Success message
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete user', description: 'Deletes a user by ID (user can delete own profile, admin can delete any)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponseWrapped(UserResponseDto)
  @ApiErrorResponse(401, 'Unauthorized', 'UNAUTHORIZED', 'Unauthorized')
  @ApiErrorResponse(403, 'Forbidden', 'FORBIDDEN', 'Forbidden')
  @ApiErrorResponse(404, 'User not found', 'NOT_FOUND', 'User not found')
  async delete(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    // Verifica se o usuário está tentando excluir seu próprio perfil ou se é admin
    if (id !== currentUser.sub && !currentUser.isAdmin) {
      throw new Error('Você não tem permissão para excluir este usuário');
    }

    await this.deleteUserUseCase.execute(id);

    return { message: 'Usuário excluído com sucesso' };
  }
}
