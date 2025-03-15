import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/modules/auth/domain/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/domain/guards/jwt-auth.guard';
import { IJwtPayload } from '@/modules/auth/domain/types/jwt-payload.type';

import { CreateStudentUseCase } from '../../domain/usecases/create-student.usecase';
import { DeleteStudentUseCase } from '../../domain/usecases/delete-student.usecase';
import { GetStudentUseCase } from '../../domain/usecases/get-student.usecase';
import { ListStudentsByClassUseCase } from '../../domain/usecases/list-students-by-class.usecase';
import { UpdateStudentUseCase } from '../../domain/usecases/update-student.usecase';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(
    private createStudentUseCase: CreateStudentUseCase,
    private getStudentUseCase: GetStudentUseCase,
    private listStudentsByClassUseCase: ListStudentsByClassUseCase,
    private updateStudentUseCase: UpdateStudentUseCase,
    private deleteStudentUseCase: DeleteStudentUseCase,
  ) {}

  @Post(':classId')
  @UseGuards(JwtAuthGuard)
  async create(
  @Param('classId') classId: string,
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const studentCreated = await this.createStudentUseCase.execute({
      name: createStudentDto.name,
      email: createStudentDto.email,
      registration: createStudentDto.registration,
      classId,
      teacherId: currentUser.sub,
    });

    return studentCreated;
  }

  @Get(':classId')
  @UseGuards(JwtAuthGuard)
  async listByClass(
  @Param('classId') classId: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const students = await this.listStudentsByClassUseCase.execute(
      classId,
      currentUser.sub,
    );

    return students;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
  @Param('id') id: string,
  ) {
    const student = await this.getStudentUseCase.execute(id);

    return student;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
  @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const updatedStudent = await this.updateStudentUseCase.execute(
      id,
      updateStudentDto,
      currentUser.sub,
    );

    return updatedStudent;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedStudent = await this.deleteStudentUseCase.execute(id, currentUser.sub);

    return deletedStudent;
  }
}
