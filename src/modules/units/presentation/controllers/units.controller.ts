/**
 * Units Controller
 *
 * Controller responsible for handling HTTP requests related to units management.
 * Units are subdivisions of classes (like bimesters or trimesters) that contain
 * evaluation items and grades.
 *
 * @module UnitsController
 * @units Presentation
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
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

import { CreateUnitUseCase } from '../../domain/usecases/create-unit.usecase';
import { DeleteUnitUseCase } from '../../domain/usecases/delete-unit.usecase';
import { GetUnitUseCase } from '../../domain/usecases/get-unit.usecase';
import { ListUnitsByClassUseCase } from '../../domain/usecases/list-units-by-class.usecase';
import { UpdateUnitFormulaUseCase } from '../../domain/usecases/update-unit-formula.usecase';
import { UpdateUnitUseCase } from '../../domain/usecases/update-unit.usecase';
import { UpsertUnitUseCase } from '../../domain/usecases/upsert-unit.usecase';
import { CreateUnitDto } from '../dtos/create-unit.dto';
import { UnitResponseDto } from '../dtos/unit-response.dto';
import { UpdateUnitFormulaDto } from '../dtos/update-unit-formula.dto';
import { UpdateUnitDto } from '../dtos/update-unit.dto';
import { UpsertUnitDto } from '../dtos/upsert-unit.dto';

@ApiTags('units')
@Controller('units')
/**
 * Controller for handling unit-related HTTP requests
 *
 * Provides endpoints for unit management operations including:
 * - Creating, reading, updating, and deleting units
 * - Upserting units (create or update)
 * - Managing unit grade formulas
 * - Listing units for a specific class
 *
 * All operations include authorization checks to ensure only teachers
 * that own a class can modify its units.
 *
 * @class UnitsController
 * @units Controller
 */
export class UnitsController {
  /**
   * Creates a UnitsController instance with injected use cases
   *
   * @param {CreateUnitUseCase} createUnitUseCase - Use case for creating units
   * @param {GetUnitUseCase} getUnitUseCase - Use case for retrieving a single unit
   * @param {ListUnitsByClassUseCase} listUnitsByClassUseCase - Use case for listing a class's units
   * @param {UpdateUnitUseCase} updateUnitUseCase - Use case for updating unit details
   * @param {DeleteUnitUseCase} deleteUnitUseCase - Use case for deleting units
   * @param {UpsertUnitUseCase} upsertUnitUseCase - Use case for upserting units
   * @param {UpdateUnitFormulaUseCase} updateUnitFormulaUseCase - Use case for updating unit formulas
   * @units Constructor
   */
  constructor(
    private createUnitUseCase: CreateUnitUseCase,
    private getUnitUseCase: GetUnitUseCase,
    private listUnitsByClassUseCase: ListUnitsByClassUseCase,
    private updateUnitUseCase: UpdateUnitUseCase,
    private deleteUnitUseCase: DeleteUnitUseCase,
    private upsertUnitUseCase: UpsertUnitUseCase,
    private updateUnitFormulaUseCase: UpdateUnitFormulaUseCase,
  ) {}

  /**
   * Creates a new unit for a class
   *
   * @param {string} classId - ID of the class to add the unit to
   * @param {CreateUnitDto} createUnitDto - Unit data for creation
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The created unit
   * @units Create
   */
  @Post(':classId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar unidade',
    description: 'Cria uma nova unidade associada a uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para criar unidades nesta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async create(
  @Param('classId') classId: string,
    @Body() createUnitDto: CreateUnitDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const unitCreated = await this.createUnitUseCase.execute({
      name: createUnitDto.name,
      classId,
      averageFormula: createUnitDto.averageFormula,
      teacherId: currentUser.sub,
      createdAt: createUnitDto.createdAt,
    });

    return unitCreated;
  }

  /**
   * Creates a new unit or updates an existing one with the same name
   *
   * @param {string} classId - ID of the class to add/update the unit
   * @param {UpsertUnitDto} upsertUnitDto - Unit data for creation/update
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The created or updated unit
   * @units Upsert
   */
  @Put(':classId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar ou atualizar unidade',
    description: 'Cria uma nova unidade ou atualiza uma existente com o mesmo nome associada a uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para modificar unidades nesta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async upsert(
  @Param('classId') classId: string,
    @Body() upsertUnitDto: UpsertUnitDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const unit = await this.upsertUnitUseCase.execute({
      name: upsertUnitDto.name,
      classId,
      averageFormula: upsertUnitDto.averageFormula,
      teacherId: currentUser.sub,
      createdAt: upsertUnitDto.createdAt,
    });

    return unit;
  }

  /**
   * Lists all units for a specific class
   *
   * @param {string} classId - ID of the class to list units from
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit[]>} Array of units for the class
   * @units Read
   */
  @Get(':classId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar unidades por turma',
    description: 'Lista todas as unidades de uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(UnitResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para listar unidades desta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async listByClass(
  @Param('classId') classId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const units = await this.listUnitsByClassUseCase.execute(
      classId,
      currentUser.sub,
    );

    return units;
  }

  /**
   * Gets a single unit by ID
   *
   * @param {string} classId - ID of the class (used for route structuring)
   * @param {string} id - ID of the unit to retrieve
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The requested unit
   * @units Read
   */
  @Get(':classId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obter unidade por ID',
    description: 'Obtém uma unidade específica pelo seu ID',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiParam({ name: 'id', description: 'ID da unidade' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para acessar esta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async getById(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const unit = await this.getUnitUseCase.execute(id, currentUser.sub);

    return unit;
  }

  /**
   * Updates a unit's information
   *
   * @param {string} classId - ID of the class (used for route structuring)
   * @param {string} id - ID of the unit to update
   * @param {UpdateUnitDto} updateUnitDto - The data to update
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The updated unit
   * @units Update
   */
  @Patch(':classId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar unidade',
    description: 'Atualiza as informações de uma unidade existente',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiParam({ name: 'id', description: 'ID da unidade' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar esta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  async update(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const updatedUnit = await this.updateUnitUseCase.execute(
      id,
      updateUnitDto,
      currentUser.sub,
    );

    return updatedUnit;
  }

  /**
   * Updates a unit's grade calculation formula
   *
   * @param {string} classId - ID of the class (used for route structuring)
   * @param {string} id - ID of the unit to update
   * @param {UpdateUnitFormulaDto} updateUnitFormulaDto - The formula data to update
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The updated unit
   * @units Formula
   */
  @Patch(':classId/:id/formula')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar fórmula da unidade',
    description: 'Atualiza a fórmula de cálculo de média da unidade',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiParam({ name: 'id', description: 'ID da unidade' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar esta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Fórmula inválida', 'INVALID_FORMULA', 'Fórmula inválida')
  async updateFormula(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @Body() updateUnitFormulaDto: UpdateUnitFormulaDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const updatedUnit = await this.updateUnitFormulaUseCase.execute(
      id,
      updateUnitFormulaDto,
      currentUser.sub,
    );

    return updatedUnit;
  }

  /**
   * Deletes a unit
   *
   * @param {string} classId - ID of the class (used for route structuring)
   * @param {string} id - ID of the unit to delete
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Unit>} The deleted unit
   * @units Delete
   */
  @Delete(':classId/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remover unidade',
    description: 'Remove uma unidade existente',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiParam({ name: 'id', description: 'ID da unidade' })
  @ApiResponseWrapped(UnitResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para remover esta unidade', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Unidade não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  async delete(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedUnit = await this.deleteUnitUseCase.execute(id, currentUser.sub);

    return deletedUnit;
  }
}
