/**
 * Pagination Interfaces
 *
 * Type definitions for pagination and search operations across the application.
 * These interfaces provide consistent typing for pagination operations.
 *
 * @module CommonInterfaces
 */

/**
 * Base interface for pagination options
 *
 * Contains the fundamental pagination parameters used
 * for paginated data retrieval operations.
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface for generic paginated result
 *
 * Basic structure for paginated data with total count.
 * Used in repositories and services for intermediate data representation.
 *
 * @template T Type of items in the data array
 */
export interface IPaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * Interface for pagination metadata
 *
 * Contains comprehensive pagination information including
 * total count, current page, items per page, and derived total pages.
 */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface for complete paginated response with metadata
 *
 * Used for API responses to provide both the data array
 * and detailed pagination metadata to clients.
 *
 * @template T Type of items in the data array
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Interface for name-based search parameters
 *
 * Contains an optional name parameter for filtering results.
 */
export interface INameSearchOptions {
  name?: string;
}

/**
 * Interface for period-based search parameters
 *
 * Contains an optional period parameter for filtering results
 * by academic period (typically in format YYYY.N).
 */
export interface IPeriodSearchOptions {
  period?: string;
}

/**
 * Interface combining pagination and name search
 *
 * Used for operations that require both pagination and name filtering.
 */
export interface IPaginationNameSearchOptions extends IPaginationOptions, INameSearchOptions {}

/**
 * Interface combining pagination and period search
 *
 * Used for operations that require both pagination and period filtering.
 */
export interface IPaginationPeriodSearchOptions extends IPaginationOptions, IPeriodSearchOptions {}

/**
 * Interface combining pagination, name search, and period search
 *
 * Used for operations that require pagination with both name and period filtering.
 * Common in academic management contexts.
 */
export interface IPaginationNamePeriodSearchOptions extends IPaginationOptions, INameSearchOptions, IPeriodSearchOptions {}
