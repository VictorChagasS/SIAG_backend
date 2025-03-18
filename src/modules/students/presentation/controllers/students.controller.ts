/**
 * Students Controller
 *
 * Controller responsible for handling HTTP requests related to students management.
 * Provides endpoints for creating, retrieving, updating, and deleting students,
 * as well as listing students for a specific class.
 *
 * @module StudentsController
 * @students Presentation
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
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

import { CreateStudentUseCase } from '../../domain/usecases/create-student.usecase';
import { DeleteStudentUseCase } from '../../domain/usecases/delete-student.usecase';
import { GetStudentUseCase } from '../../domain/usecases/get-student.usecase';
import { ListStudentsByClassUseCase } from '../../domain/usecases/list-students-by-class.usecase';
import { UpdateStudentUseCase } from '../../domain/usecases/update-student.usecase';
import { StudentSearchQueryDto } from '../dto/student-search-query.dto';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { StudentResponseDto } from '../dtos/student-response.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';

@ApiTags('students')
@Controller('students')
/**
 * Controller for handling student-related HTTP requests
 *
 * Provides endpoints for student management operations including:
 * - Creating, reading, updating, and deleting students
 * - Listing students for a specific class with search capabilities
 *
 * All operations include authorization checks to ensure only teachers
 * that own a class can modify its students.
 *
 * @class StudentsController
 * @students Controller
 */
export class StudentsController {
  /**
   * Creates a StudentsController instance with injected use cases
   *
   * @param {CreateStudentUseCase} createStudentUseCase - Use case for creating students
   * @param {GetStudentUseCase} getStudentUseCase - Use case for retrieving a single student
   * @param {ListStudentsByClassUseCase} listStudentsByClassUseCase - Use case for listing a class's students
   * @param {UpdateStudentUseCase} updateStudentUseCase - Use case for updating student details
   * @param {DeleteStudentUseCase} deleteStudentUseCase - Use case for deleting students
   * @students Constructor
   */
  constructor(
    private createStudentUseCase: CreateStudentUseCase,
    private getStudentUseCase: GetStudentUseCase,
    private listStudentsByClassUseCase: ListStudentsByClassUseCase,
    private updateStudentUseCase: UpdateStudentUseCase,
    private deleteStudentUseCase: DeleteStudentUseCase,
  ) {}

  /**
   * Creates a new student for a class
   *
   * @param {string} classId - ID of the class to add the student to
   * @param {CreateStudentDto} createStudentDto - Student data for creation
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Student>} The created student
   * @students Create
   */
  @Post(':classId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Criar estudante',
    description: 'Cria um novo estudante associado a uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(StudentResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para criar estudantes nesta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
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
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar estudantes por turma',
    description: 'Lista todos os estudantes de uma turma específica',
  })
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @ApiResponseWrapped(StudentResponseDto, true)
  @ApiErrorResponse(403, 'Você não tem permissão para listar estudantes desta turma', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Turma não encontrada', 'NOT_FOUND', 'Recurso não encontrado')
  /**
   * Lists all students for a specific class
   *
   * @param {string} classId - ID of the class to list students from
   * @param {IJwtPayload} currentUser - The authenticated user
   * @param {StudentSearchQueryDto} query - Search parameters for filtering students
   * @returns {Promise<Student[]>} Array of students for the class
   * @students Read
   */
  async listByClass(
  @Param('classId') classId: string,
    @CurrentUser() currentUser: IJwtPayload,
    @Query() query: StudentSearchQueryDto,
  ) {
    const students = await this.listStudentsByClassUseCase.execute({
      classId,
      teacherId: currentUser.sub,
      ...query,
    });

    return students;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obter estudante por ID',
    description: 'Obtém um estudante específico pelo seu ID',
  })
  @ApiParam({ name: 'id', description: 'ID do estudante' })
  @ApiResponseWrapped(StudentResponseDto)
  @ApiErrorResponse(404, 'Estudante não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  /**
   * Gets a single student by ID
   *
   * @param {string} id - ID of the student to retrieve
   * @returns {Promise<Student>} The requested student
   * @students Read
   */
  async getById(
  @Param('id') id: string,
  ) {
    const student = await this.getStudentUseCase.execute(id);

    return student;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Atualizar estudante',
    description: 'Atualiza as informações de um estudante existente',
  })
  @ApiParam({ name: 'id', description: 'ID do estudante' })
  @ApiResponseWrapped(StudentResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para atualizar este estudante', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Estudante não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  @ApiErrorResponse(400, 'Dados inválidos', 'INVALID_DATA', 'Dados inválidos')
  /**
   * Updates a student's information
   *
   * @param {string} id - ID of the student to update
   * @param {UpdateStudentDto} updateStudentDto - The data to update
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Student>} The updated student
   * @students Update
   */
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
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remover estudante',
    description: 'Remove um estudante existente',
  })
  @ApiParam({ name: 'id', description: 'ID do estudante' })
  @ApiResponseWrapped(StudentResponseDto)
  @ApiErrorResponse(403, 'Você não tem permissão para remover este estudante', 'FORBIDDEN', 'Acesso negado')
  @ApiErrorResponse(404, 'Estudante não encontrado', 'NOT_FOUND', 'Recurso não encontrado')
  /**
   * Deletes a student
   *
   * @param {string} id - ID of the student to delete
   * @param {IJwtPayload} currentUser - The authenticated user
   * @returns {Promise<Student>} The deleted student (before deletion)
   * @students Delete
   */
  async delete(
  @Param('id') id: string,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    const deletedStudent = await this.deleteStudentUseCase.execute(id, currentUser.sub);

    return deletedStudent;
  }
}
