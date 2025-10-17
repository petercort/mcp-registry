import type { ErrorObject } from "ajv";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly payload?: unknown;

  constructor(statusCode: number, message: string, payload?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export class ValidationError extends HttpError {
  public readonly errors: ErrorObject[];

  constructor(message: string, errors: ErrorObject[]) {
    super(400, message, { errors });
    this.errors = errors;
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

