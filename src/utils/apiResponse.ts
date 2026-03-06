import type { Response } from "express";

export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    error?: string;
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        statusCode,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    error?: string
): Response => {
    const response: ApiResponse = {
        success: false,
        statusCode,
        message,
        error,
    };
    return res.status(statusCode).json(response);
};
