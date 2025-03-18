import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponseDto } from '../dtos/api-response.dto';

@Injectable()
export class TransformInterceptor<T>
implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data) => ({
        message: 'Operação realizada com sucesso',
        result: data,
      })),
    );
  }
}
