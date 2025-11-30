import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object | string[] = 'Erro interno no servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        message = responseBody['message'] as string | string[];
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          const target = Array.isArray(exception.meta?.target)
            ? exception.meta.target.join(', ')
            : 'campo único';
          message = `O registro que você tentou criar já existe. Violação no(s) campo(s): ${target}.`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Recurso não encontrado para a operação solicitada.';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erro inesperado no banco de dados.';
      }
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
