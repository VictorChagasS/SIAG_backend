import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/types/jwt-payload.type';
import { CreateUserUseCase } from '@/modules/users/domain/usecases/create-user.usecase';
import { DeleteUserUseCase } from '@/modules/users/domain/usecases/delete-user.usecase';
import { GetUserProfileUseCase } from '@/modules/users/domain/usecases/get-user-profile.usecase';
import { ListUsersUseCase } from '@/modules/users/domain/usecases/list-users.usecase';
import { IUpdateUserDTO, UpdateUserUseCase } from '@/modules/users/domain/usecases/update-user.usecase';
import { CreateUserDto } from '@/modules/users/presentation/dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      isAdmin: createUserDto.isAdmin,
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
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

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listAll() {
    const users = await this.listUsersUseCase.execute();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
  @Param('id') id: string,
    @Body() updateUserDto: IUpdateUserDTO,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    // Verifica se o usuário está tentando atualizar seu próprio perfil ou se é admin
    if (id !== currentUser.sub && !currentUser.isAdmin) {
      throw new Error('Você não tem permissão para atualizar este usuário');
    }

    // Apenas admins podem atualizar o campo isAdmin
    if (updateUserDto.isAdmin !== undefined && !currentUser.isAdmin) {
      throw new Error('Apenas administradores podem alterar o status de administrador');
    }

    const updatedUser = await this.updateUserUseCase.execute(id, updateUserDto);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
