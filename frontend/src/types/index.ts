export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface File {
    id: number;
    filename: string;
    filepath: string;
    mimeType: string;
    fileSize: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
    errors?: string[];
}   