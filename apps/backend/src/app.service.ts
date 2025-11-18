import { Injectable } from '@nestjs/common';
import { appConfig } from '@repo/config';

@Injectable()
export class AppService {
  getGreeting(): string {
    return `Hello from the ${appConfig.name} backend!`;
  }
}
