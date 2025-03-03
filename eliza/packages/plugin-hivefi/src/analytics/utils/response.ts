/**
 * Standard response interface for all API calls
 */
export interface StandardResponse<T = any> {
  success: boolean;
  result?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Create a success response
 * @param result The result data
 * @returns StandardResponse with success=true
 */
export function createSuccessResponse<T>(result: T): StandardResponse<T> {
  return {
    success: true,
    result,
  };
}

/**
 * Create an error response
 * @param code Error code
 * @param message Error message
 * @returns StandardResponse with success=false
 */
export function createErrorResponse(code: string, message: string): StandardResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
} 