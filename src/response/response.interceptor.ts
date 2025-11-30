import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

interface Response<T> {
  statusCode: number;
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const executionTime = Date.now() - now;
        console.log(
          `[${request.method}] ${request.url} - Tempo de Execução: ${executionTime}ms (Status: ${response.statusCode})`,
        );
      }),

      map((data) => ({
        statusCode: response.statusCode || HttpStatus.OK,
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - now,
        data,
      })),
    );
  }
}
