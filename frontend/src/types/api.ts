// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;

// API Error Types
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}
