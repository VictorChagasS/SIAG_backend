/**
 * Evaluation Items Controller
 *
 * Handles HTTP requests related to evaluation items management.
 * Provides endpoints for creating, retrieving, updating, and deleting
 * evaluation items within units.
 *
 * @module EvaluationItemsControllers
 * @evaluation-items Presentation
 */
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

/**
 * REST API controller for evaluation items operations
 *
 * Provides endpoints for CRUD operations on evaluation items.
 * All endpoints require authentication and appropriate permissions.
 *
 * @class EvaluationItemsController
 * @evaluation-items Controller
 */
@ApiTags('evaluation-items')
@Controller('evaluation-items')
export class EvaluationItemsController {
  /**
   * Creates a controller instance with required use cases
   *
   * @param {CreateEvaluationItemUseCase} createEvaluationItemUseCase - For creating new evaluation items
   * @param {GetEvaluationItemUseCase} getEvaluationItemUseCase - For retrieving evaluation items
   * @param {ListEvaluationItemsByUnitUseCase} listEvaluationItemsByUnitUseCase - For listing evaluation items by unit
   * @param {UpdateEvaluationItemUseCase} updateEvaluationItemUseCase - For updating evaluation items
   * @param {DeleteEvaluationItemUseCase} deleteEvaluationItemUseCase - For deleting evaluation items
   * @evaluation-items Constructor
   */
  constructor(
    private createEvaluationItemUseCase: CreateEvaluationItemUseCase,
    private getEvaluationItemUseCase: GetEvaluationItemUseCase,
    private listEvaluationItemsByUnitUseCase: ListEvaluationItemsByUnitUseCase,
    private updateEvaluationItemUseCase: UpdateEvaluationItemUseCase,
    private deleteEvaluationItemUseCase: DeleteEvaluationItemUseCase,
  ) {}

  /**
   * Creates a new evaluation item for a specific unit
   *
   * @param {string} unitId - The unit ID to create the evaluation item in
   * @param {CreateEvaluationItemDto} createEvaluationItemDto - The evaluation item data
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<EvaluationItemResponseDto>} The created evaluation item
   * @evaluation-items Create
   */
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
      ...createEvaluationItemDto,
      unitId,
      teacherId: currentUser.sub,
    });

    return evaluationItemCreated;
  }

  /**
   * Lists all evaluation items belonging to a specific unit
   *
   * @param {string} unitId - The unit ID to list evaluation items for
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<EvaluationItemResponseDto[]>} Array of evaluation items
   * @evaluation-items Read
   */
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

  /**
   * Retrieves a specific evaluation item by its ID
   *
   * @param {string} unitId - The unit ID (used for routing purposes)
   * @param {string} id - The evaluation item ID to retrieve
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<EvaluationItemResponseDto>} The requested evaluation item
   * @evaluation-items Read
   */
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

  /**
   * Updates an existing evaluation item
   *
   * @param {string} unitId - The unit ID (used for routing purposes)
   * @param {string} id - The evaluation item ID to update
   * @param {UpdateEvaluationItemDto} updateEvaluationItemDto - The data to update
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<EvaluationItemResponseDto>} The updated evaluation item
   * @evaluation-items Update
   */
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

  /**
   * Deletes an existing evaluation item
   *
   * @param {string} unitId - The unit ID (used for routing purposes)
   * @param {string} id - The evaluation item ID to delete
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<EvaluationItemResponseDto>} The deleted evaluation item
   * @evaluation-items Delete
   */
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
