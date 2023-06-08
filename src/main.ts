import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // agregar prefijo global
  app.setGlobalPrefix('api/v2')

  /*
    Dependencia para validaciones globales de los DTO
  * */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:true,
      transformOptions:{
        enableImplicitConversion:true,
      }
      })

  );

  await app.listen(3000);
}
bootstrap( );
