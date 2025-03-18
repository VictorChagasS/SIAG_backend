import { ClassResponseDto } from './class-response.dto';

import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';

/**
 * DTO para resposta paginada de turmas
 */
export class PaginatedClassResponseDto extends PaginatedResponseDto<ClassResponseDto> {
  constructor() {
    super();
    (this as any).itemType = ClassResponseDto;
  }
}
