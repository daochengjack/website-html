import { Module } from '@nestjs/common';

import { AdminCategoriesController } from './categories.controller';
import { AdminCategoriesService } from './categories.service';

@Module({
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
  exports: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
