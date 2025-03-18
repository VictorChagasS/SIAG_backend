/**
 * HTTP Exception Filter
 *
 * A global exception filter that catches and formats all exceptions
 * in a standardized way for consistent API error responses.
 *
 * This filter handles various exception types and converts them into
 * a consistent error format that is easier for API consumers to process.
 *
 * @module CommonFilters
 */
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

/**
 * Standard error response structure
 *
 * Defines the format of error objects returned in API responses.
 * Each error has a code, title, and detailed messages.
 *
 * @interface IErrorResponse
 */
interface IErrorResponse {
  /** Machine-readable error code for programmatic handling */
  code: string;

  /** Human-readable error title */
  title: string;

  /** Array of detailed error messages */
  detail: string[];
}

/**
 * Global HTTP exception filter
 *
 * Catches all exceptions thrown during request processing and
 * transforms them into a standardized error response format.
 *
 * @class HttpExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Main exception handler method
   *
   * Processes the caught exception and formats it into a standardized
   * error response for the client.
   *
   * @param {unknown} exception - The exception that was thrown
   * @param {ArgumentsHost} host - The host arguments (contains request/response objects)
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errors: IErrorResponse[] = this.formatErrors(exception);

    response.status(this.getStatusCode(exception)).json({ errors });
  }

  /**
   * Formats exceptions into standardized error responses
   *
   * Converts different types of exceptions into the standard error format
   * with appropriate codes, titles, and details.
   *
   * @param {unknown} exception - The exception to format
   * @returns {IErrorResponse[]} Array of formatted error responses
   * @private
   */
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

  /**
   * Extracts the field name from a validation error message
   *
   * Uses regex patterns to identify which field a validation error
   * is referring to, which helps in grouping related errors.
   *
   * @param {string} error - The validation error message
   * @returns {string} The extracted field name, or 'unknown' if not found
   * @private
   */
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

  /**
   * Formats a validation error message for better readability
   *
   * Removes redundant parts of the error message, such as field
   * name references that are already handled through grouping.
   *
   * @param {string} error - The original validation error message
   * @returns {string} The formatted error message
   * @private
   */
  private formatValidationError(error: string): string {
    // Remove referências ao nome do campo do início da mensagem
    return error.replace(/^(?:field|property) '\w+' /, '');
  }

  /**
   * Determines the appropriate HTTP status code for the response
   *
   * Extracts the status code from HTTP exceptions or defaults to 500
   * for other types of errors.
   *
   * @param {unknown} exception - The exception to get the status code from
   * @returns {number} The HTTP status code
   * @private
   */
  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return 500;
  }
}
