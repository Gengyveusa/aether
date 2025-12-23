export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, opts?: { code?: string; status?: number }) {
    super(message);
    this.name = "AppError";
    this.code = opts?.code ?? "APP_ERROR";
    this.status = opts?.status ?? 500;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, { code: "NOT_FOUND", status: 404 });
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, { code: "BAD_REQUEST", status: 400 });
    this.name = "BadRequestError";
  }
}
