import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ApiErrorResponse, ApiResponseWrapped } from '@/common/utils/swagger.utils';
import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { CreateEvaluationItemUseCase } from '../../domain/usecases/create-evaluation-item.usecase';
import { DeleteEvaluationItemUseCase } from '../../domain/usecases/delete-evaluation-item.usecase';
import { GetEvaluationItemUseCase } from '../../domain/usecases/get-evaluation-item.usecase';
import { ListEvaluationItemsByUnitUseCase } from '../../domain/usecases/list-evaluation-items-by-unit.usecase';
import { UpdateEvaluationItemUseCase } from '../../domain/usecases/update-evaluation-item.usecase';
import { CreateEvaluationItemDto } from '../dtos/create-evaluation-item.dto';
import { EvaluationItemResponseDto } from '../dtos/evaluation-item-response.dto';
import { UpdateEvaluationItemDto } from '../dtos/update-evaluation-item.dto';

@ApiTags('evaluation-items')
@Controller('evaluation-items')
export class EvaluationItemsController {
  constructor(
    private createEvaluationItemUseCase: CreateEvaluationItemUseCase,
    private getEvaluationItemUseCase: GetEvaluationItemUseCase,
    private listEvaluationItemsByUnitUseCase: ListEvaluationItemsByUnitUseCase,
    private updateEvaluationItemUseCase: UpdateEvaluationItemUseCase,
    private deleteEvaluationItemUseCase: DeleteEvaluationItemUseCase,
  ) {}

  @Post(':unitId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar item de avaliação',
    description: 'Cria um novo item de avaliação associado a uma unidade específica',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiResponseWrapped(EvaluationItemResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para criar itens de avaliação nesta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async create(
  @Param('unitId') unitId: string,
    @Body() createEvaluationItemDto: CreateEvaluationItemDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const evaluationItemCreated = await this.createEvaluationItemUseCase.execute({
      name: createEvaluationItemDto.name,
      unitId,
      teacherId: currentUser.sub,
    });

    return evaluationItemCreated;
  }

  @Get(':unitId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar itens de avaliação por unidade',
    description: 'Lista todos os itens de avaliação de uma unidade específica',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiResponseWrapped(EvaluationItemResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para listar itens de avaliação desta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async listByUnit(
  @Param('unitId') unitId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const evaluationItems = await this.listEvaluationItemsByUnitUseCase.execute(
      unitId,
      currentUser.sub,
    );

    return evaluationItems;
  }

  @Get(':unitId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obter item de avaliação por ID',
    description: 'Obtém um item de avaliação específico pelo seu ID',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiParam({ name: 'id', description: 'ID do item de avaliação' })
  @ApiResponseWrapped(EvaluationItemResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar este item de avaliação', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Item de avaliação não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  async getById(
  @Param('unitId') unitId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const evaluationItem = await this.getEvaluationItemUseCase.execute(id, currentUser.sub);

    return evaluationItem;
  }

  @Patch(':unitId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar item de avaliação',
    description: 'Atualiza um item de avaliação existente',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiParam({ name: 'id', description: 'ID do item de avaliação' })
  @ApiResponseWrapped(EvaluationItemResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar este item de avaliação', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Item de avaliação não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async update(
  @Param('unitId') unitId: string,
    @Param('id') id: string,
    @Body() updateEvaluationItemDto: UpdateEvaluationItemDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const updatedEvaluationItem = await this.updateEvaluationItemUseCase.execute(
      id,
      updateEvaluationItemDto,
      currentUser.sub,
    );

    return updatedEvaluationItem;
  }

  @Delete(':unitId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remover item de avaliação',
    description: 'Remove um item de avaliação existente',
  })
  @ApiParam({ name: 'unitId', description: 'ID da unidade' })
  @ApiParam({ name: 'id', description: 'ID do item de avaliação' })
  @ApiResponseWrapped(EvaluationItemResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para remover este item de avaliação', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Item de avaliação não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  async delete(
  @Param('unitId') unitId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedEvaluationItem = await this.deleteEvaluationItemUseCase.execute(id, currentUser.sub);

    return deletedEvaluationItem;
  }
}
