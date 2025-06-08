/**
 * API通用响应结构
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}



/**
 * 分页数据结构
 */
export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 通用分页参数
 */
export interface PaginationParams {
  /** 页码，默认为 1 */
  page?: number;
  /** 每页条数，默认为 10，最大 100 */
  pageSize?: number;
} 