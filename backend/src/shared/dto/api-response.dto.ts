import { HttpStatus } from "@nestjs/common";

export class GlobalApiResponseDto<T = any> {
  message: string;

  statusCode: HttpStatus;

  data?: T;

  error?: {
    source?: string;
    details?: string;
  };
}
