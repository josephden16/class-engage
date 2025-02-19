import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

export const DisableResponseInterceptor = () =>
  SetMetadata("disableResponseInterceptor", true);

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isDisabled = this.reflector.get<boolean>(
      "disableResponseInterceptor",
      context.getHandler(),
    );

    // If the interceptor is disabled for this route, return the response as is
    if (isDisabled) {
      return next.handle();
    }

    // Otherwise, apply the interceptor logic
    return next.handle().pipe(
      map((responseData) => {
        const response = context.switchToHttp().getResponse();
        const message = responseData?.message;
        const data = responseData?.data || responseData;

        return {
          statusCode: response.statusCode,
          message,
          data,
        };
      }),
    );
  }
}
