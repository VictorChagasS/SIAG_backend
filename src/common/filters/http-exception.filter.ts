import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';

interface IErrorResponse {
  code: string;
  title: string;
  detail: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors: IErrorResponse[] = this.formatErrors(exception);

    response.status(this.getStatusCode(exception)).json({ errors });
  }

  private formatErrors(exception: unknown): IErrorResponse[] {
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as any;
      if (response.message && Array.isArray(response.message)) {
        const errorsByField = new Map<string, string[]>();

        response.message.forEach((error: string) => {
          const field = this.extractFieldName(error);
          if (!errorsByField.has(field)) {
            errorsByField.set(field, []);
          }
          errorsByField.get(field)!.push(this.formatValidationError(error));
        });

        return Array.from(errorsByField.entries()).map(([field, details]) => ({
          code: 'INVALID_DATA',
          title: `campo '${field}' é inválido`,
          detail: details,
        }));
      }
    }

    if (exception instanceof UnauthorizedException) {
      const response = exception.getResponse() as any;
      // Se tiver um formato personalizado, usa ele
      if (response.code && response.title && response.detail) {
        return [{
          code: response.code,
          title: response.title,
          detail: response.detail,
        }];
      }
      // Se tiver apenas mensagem, usa ela
      if (response.message) {
        return [{
          code: 'UNAUTHORIZED',
          title: 'Não autorizado',
          detail: [response.message],
        }];
      }
      // Caso contrário, usa o formato padrão
      return [{
        code: 'UNAUTHORIZED',
        title: 'Não autorizado',
        detail: ['Credenciais inválidas'],
      }];
    }

    if (exception instanceof ConflictException) {
      const response = exception.getResponse() as any;
      if (response.code && response.title && response.detail) {
        return [{
          code: response.code,
          title: response.title,
          detail: response.detail,
        }];
      }
      // Caso contrário, usa o formato padrão
      return [{
        code: 'CONFLICT',
        title: 'Conflito de dados',
        detail: [response.message || 'Ocorreu um conflito ao processar sua requisição'],
      }];
    }

    if (exception instanceof ForbiddenException) {
      return [{
        code: 'FORBIDDEN',
        title: 'Acesso negado',
        detail: ['Você não tem permissão para acessar este recurso'],
      }];
    }

    if (exception instanceof NotFoundException) {
      return [{
        code: 'NOT_FOUND',
        title: 'Recurso não encontrado',
        detail: ['O recurso solicitado não foi encontrado'],
      }];
    }

    if (exception instanceof Error) {
      return [{
        code: 'INTERNAL_ERROR',
        title: 'Erro interno',
        detail: [exception.message],
      }];
    }

    return [{
      code: 'INTERNAL_ERROR',
      title: 'Erro interno do servidor',
      detail: ['Ocorreu um erro inesperado'],
    }];
  }

  private extractFieldName(error: string): string {
    // Primeiro, tenta encontrar o padrão "field 'nome'"
    const fieldMatch = error.match(/(?:field|property) '(\w+)'/i);
    if (fieldMatch) return fieldMatch[1];

    // Se não encontrar, tenta extrair o nome do campo diretamente da mensagem
    // Por exemplo: "name should not be empty" -> "name"
    const directMatch = error.match(/^(\w+)\s+(?:should|must|is)/i);
    if (directMatch) return directMatch[1];

    // Se ainda não encontrou, procura por outros padrões comuns
    const otherPatterns = error.match(/^(\w+).*(?:is required|cannot be)/i);
    if (otherPatterns) return otherPatterns[1];

    return 'unknown';
  }

  private formatValidationError(error: string): string {
    // Remove referências ao nome do campo do início da mensagem
    return error.replace(/^(?:field|property) '\w+' /, '');
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return 500;
  }
}
