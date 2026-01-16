export interface ContactUsEntry {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    message: string;
    phone: string;
    service: string;
    createdAt: string;
    updatedAt: string;
    type: string;
  }
  
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
 export interface ApiResponse {
    success: boolean;
    message: string;
    responseObject: {
      data: ContactUsEntry[];
      pagination: Pagination;
    };
    statusCode: number;
  }
  
 export interface FilterPayload {
    startDate?: string;
    endDate?: string;
    firstName?: string;
    email?: string;
    service?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }

