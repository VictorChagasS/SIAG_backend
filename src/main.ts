import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { ApiErrorDto } from '@/common/dtos/api-error.dto';
import { ApiResponseDto } from '@/common/dtos/api-response.dto';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { UpdateClassFormulaDto } from '@/modules/classes/presentation/dtos/update-class-formula.dto';
import { EvaluationItemResponseDto } from '@/modules/evaluation-items/presentation/dtos/evaluation-item-response.dto';
import { AllAveragesResponseDto } from '@/modules/grades/presentation/dtos/all-averages-response.dto';
import { GradeResponseDto } from '@/modules/grades/presentation/dtos/grade-response.dto';
import { UnitAverageResponseDto } from '@/modules/grades/presentation/dtos/unit-average-response.dto';
import { InstitutionResponseDto } from '@/modules/institutions/dtos/institution-response.dto';
import { InstitutionsSearchResponseDto } from '@/modules/institutions/dtos/institutions-search-response.dto';
import { PaginatedInstitutionsResponseDto } from '@/modules/institutions/dtos/paginated-institutions-response.dto';
import { PaginationMetaDto } from '@/modules/institutions/dtos/pagination-meta.dto';
import { StudentResponseDto } from '@/modules/students/presentation/dtos/student-response.dto';
import { UnitResponseDto } from '@/modules/units/presentation/dtos/unit-response.dto';
import { UpdateUnitFormulaDto } from '@/modules/units/presentation/dtos/update-unit-formula.dto';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors();

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  // Filtro global para tratamento de exceções
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor global para transformar respostas
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('SIAG API')
    .setDescription('API do Sistema Integrado de Apoio à Gestão de Notas e Conceitos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT',
        in: 'header',
      },
      'JWT', // Este é o nome de referência usado em @ApiBearerAuth('JWT')
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      ApiResponseDto,
      ApiErrorDto,
      UpdateClassFormulaDto,
      UpdateUnitFormulaDto,
      StudentResponseDto,
      UnitResponseDto,
      InstitutionResponseDto,
      PaginatedInstitutionsResponseDto,
      InstitutionsSearchResponseDto,
      PaginationMetaDto,
      GradeResponseDto,
      UnitAverageResponseDto,
      AllAveragesResponseDto,
      EvaluationItemResponseDto,
    ],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
