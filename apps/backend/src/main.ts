import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { appConfig } from '@repo/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend running in ${appConfig.environment} mode on http://localhost:${port}`);
}

bootstrap();
