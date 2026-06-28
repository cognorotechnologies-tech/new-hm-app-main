import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any;
};

export function apiResponse<T>(
    data: T,
    options: { status?: number; message?: string } = {}
) {
    const { status = 200, message = "Success" } = options;
    return NextResponse.json<ApiResponse<T>>(
        { success: true, message, data },
        { status }
    );
}

export function apiError(
    error: unknown,
    options: { status?: number; message?: string } = {}
) {
    console.error("API Error:", error);

    let status = options.status || 500;
    let message = options.message || "Internal Server Error";
    let errors: any = undefined;

    if (error instanceof ZodError) {
        status = 400;
        message = "Validation Error";
        errors = error.flatten().fieldErrors;
    } else if (error instanceof Error) {
        // Don't expose internal error details in production unless essential
        // message = error.message; 
    }

    return NextResponse.json<ApiResponse>(
        { success: false, message, errors },
        { status }
    );
}
