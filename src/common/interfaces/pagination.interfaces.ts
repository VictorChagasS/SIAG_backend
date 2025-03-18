/**
 * Interface base para opções de paginação
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface para resultado paginado genérico
 */
export interface IPaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * Interface para metadados de paginação
 */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface para resposta paginada completa com metadados
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Interface para parâmetros de pesquisa por nome
 */
export interface INameSearchOptions {
  name?: string;
}

/**
 * Interface para parâmetros de pesquisa por período
 */
export interface IPeriodSearchOptions {
  period?: string;
}

/**
 * Interface combinando paginação e pesquisa por nome
 */
export interface IPaginationNameSearchOptions extends IPaginationOptions, INameSearchOptions {}

/**
 * Interface combinando paginação e pesquisa por período
 */
export interface IPaginationPeriodSearchOptions extends IPaginationOptions, IPeriodSearchOptions {}

/**
 * Interface combinando paginação, pesquisa por nome e por período
 */
export interface IPaginationNamePeriodSearchOptions extends IPaginationOptions, INameSearchOptions, IPeriodSearchOptions {}
