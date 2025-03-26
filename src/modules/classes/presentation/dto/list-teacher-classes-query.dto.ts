/**
 * List Teacher Classes Query DTO
 *
 * Data Transfer Object for querying a teacher's classes with pagination and filtering.
 * Used in the controller to validate and process query parameters.
 *
 * @module ClassDTOs
 */
import { PaginationNamePeriodQueryDto } from '@/common/dtos/pagination-name-period-query.dto';

/**
 * DTO for paginated queries of teacher classes with name and period filtering
 *
 * Extends the base pagination DTO that includes name and period filters.
 * Used in API endpoints that list classes for a specific teacher.
 *
 * @class ListTeacherClassesQueryDto
 * @extends {PaginationNamePeriodQueryDto}
 */
export class ListTeacherClassesQueryDto extends PaginationNamePeriodQueryDto {}
