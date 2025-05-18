import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import {cors} from 'cors';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'https://weather-client-pi.vercel.app', // Твій фронтенд
    credentials: true, // Дозволити передачу cookie
  });
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('API for creating users')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 8000);
}
bootstrap();
