import { NextResponse } from 'next/server';

// ── AppError ──────────────────────────────────────────────────────────────────
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ── sendResponse ──────────────────────────────────────────────────────────────
interface ApiResponseBody {
  success: boolean;
  message: string;
  data?: unknown;
}

export function sendResponse(
  statusCode: number,
  success: boolean,
  message: string,
  data: unknown = null
): NextResponse<ApiResponseBody> {
  const body: ApiResponseBody = { success, message };
  if (data) {
    body.data = data;
  }
  return NextResponse.json(body, { status: statusCode });
}

// ── withErrorHandling ─────────────────────────────────────────────────────────
type RouteHandler = (
  req: Request,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        const body: ApiResponseBody & { stack?: string } = {
          success: false,
          message: err.message,
        };
        if (process.env.NODE_ENV === 'development') {
          body.stack = err.stack;
        }
        return NextResponse.json(body, { status: err.statusCode });
      }

      console.error('Unhandled error:', err);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: err instanceof Error ? err.stack : undefined,
          }),
        },
        { status: 500 }
      );
    }
  };
}
