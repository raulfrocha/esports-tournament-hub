import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { CustomHttpExceptionFilter } from './custom-http-exception/custom-http-exception.filter';
import { ResponseInterceptor } from './response/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  console.log("-> 🚀 INICIANDO APLICAÇÃO NESTJS...");
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }
  ));
  
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  
  app.useGlobalInterceptors(new ResponseInterceptor());


  const config = new DocumentBuilder()
    .setTitle('eSports Tournament Hub API')
    .setDescription('API de Gerenciamento de Campeonatos eSports')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 
      'JWT-Auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger Docs available at: ${await app.getUrl()}/api/docs`);
}

bootstrap();