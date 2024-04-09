export interface IFormatExceptionMessage {
  message: string;
  code: string;
  details?: string;
  stack?: any;
}

export interface IExceptions {
  throwInternalError(error: IFormatExceptionMessage): void;
  throwNotFound(): void;
  throwForbidden(): void;
}
