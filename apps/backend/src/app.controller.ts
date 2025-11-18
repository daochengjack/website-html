import { Controller, Get } from '@nestjs/common';
import type { User } from '@repo/types';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): { message: string; sampleUser: User } {
    return {
      message: this.appService.getGreeting(),
      sampleUser: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'demo@example.com',
        displayName: 'Demo User'
      }
    };
  }
}
