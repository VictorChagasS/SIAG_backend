import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { CreateEvaluationItemUseCase } from '../../domain/usecases/create-evaluation-item.usecase';
import { DeleteEvaluationItemUseCase } from '../../domain/usecases/delete-evaluation-item.usecase';
import { GetEvaluationItemUseCase } from '../../domain/usecases/get-evaluation-item.usecase';
import { ListEvaluationItemsByUnitUseCase } from '../../domain/usecases/list-evaluation-items-by-unit.usecase';
import { UpdateEvaluationItemUseCase } from '../../domain/usecases/update-evaluation-item.usecase';
import { CreateEvaluationItemDto } from '../dtos/create-evaluation-item.dto';
import { UpdateEvaluationItemDto } from '../dtos/update-evaluation-item.dto';

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
  async delete(
  @Param('unitId') unitId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedEvaluationItem = await this.deleteEvaluationItemUseCase.execute(id, currentUser.sub);

    return deletedEvaluationItem;
  }
}
