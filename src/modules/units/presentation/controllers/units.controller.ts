import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';

import { CreateUnitUseCase } from '../../domain/usecases/create-unit.usecase';
import { DeleteUnitUseCase } from '../../domain/usecases/delete-unit.usecase';
import { GetUnitUseCase } from '../../domain/usecases/get-unit.usecase';
import { ListUnitsByClassUseCase } from '../../domain/usecases/list-units-by-class.usecase';
import { UpdateUnitFormulaUseCase } from '../../domain/usecases/update-unit-formula.usecase';
import { UpdateUnitUseCase } from '../../domain/usecases/update-unit.usecase';
import { UpsertUnitUseCase } from '../../domain/usecases/upsert-unit.usecase';
import { CreateUnitDto } from '../dtos/create-unit.dto';
import { UpdateUnitFormulaDto } from '../dtos/update-unit-formula.dto';
import { UpdateUnitDto } from '../dtos/update-unit.dto';
import { UpsertUnitDto } from '../dtos/upsert-unit.dto';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

@Controller('units')
export class UnitsController {
  constructor(
    private createUnitUseCase: CreateUnitUseCase,
    private getUnitUseCase: GetUnitUseCase,
    private listUnitsByClassUseCase: ListUnitsByClassUseCase,
    private updateUnitUseCase: UpdateUnitUseCase,
    private deleteUnitUseCase: DeleteUnitUseCase,
    private upsertUnitUseCase: UpsertUnitUseCase,
    private updateUnitFormulaUseCase: UpdateUnitFormulaUseCase,
  ) {}

  @Post(':classId')
  @UseGuards(JwtAuthGuard)
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
    });

    return unitCreated;
  }

  @Put(':classId')
  @UseGuards(JwtAuthGuard)
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
    });

    return unit;
  }

  @Get(':classId')
  @UseGuards(JwtAuthGuard)
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

  @Get(':classId/:id')
  @UseGuards(JwtAuthGuard)
  async getById(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const unit = await this.getUnitUseCase.execute(id, currentUser.sub);

    return unit;
  }

  @Patch(':classId/:id')
  @UseGuards(JwtAuthGuard)
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

  @Patch('/:id/formula')
  @UseGuards(JwtAuthGuard)
  async updateFormula(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @Body() updateUnitFormulaDto: UpdateUnitFormulaDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const updatedUnit = await this.updateUnitFormulaUseCase.execute(
      id,
      updateUnitFormulaDto.formula,
      currentUser.sub,
    );

    return updatedUnit;
  }

  @Delete(':classId/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
  @Param('classId') classId: string,
    @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedUnit = await this.deleteUnitUseCase.execute(id, currentUser.sub);

    return deletedUnit;
  }
}
