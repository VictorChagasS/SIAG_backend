/**
 * Paginated Class Response DTO
 *
 * Data Transfer Object for paginated class responses returned by API endpoints.
 * Extends the generic paginated response with class-specific typing.
 *
 * @module ClassDTOs
 */
import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';

import { ClassResponseDto } from './class-response.dto';

/**
 * DTO for paginated class responses
 *
 * Extends the generic paginated response DTO with class-specific typing
 * to provide proper TypeScript and Swagger documentation support.
 *
 * @class PaginatedClassResponseDto
 * @extends {PaginatedResponseDto<ClassResponseDto>}
 */
export class PaginatedClassResponseDto extends PaginatedResponseDto<ClassResponseDto> {
  /**
   * Creates an instance of PaginatedClassResponseDto
   *
   * Sets the item type to ClassResponseDto for proper serialization
   */
  constructor() {
    super();
    (this as any).itemType = ClassResponseDto;
  }
}
