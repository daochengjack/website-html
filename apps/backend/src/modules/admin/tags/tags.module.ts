import { Module } from '@nestjs/common';

import { AdminTagsController } from './tags.controller';
import { AdminTagsService } from './tags.service';

@Module({
  controllers: [AdminTagsController],
  providers: [AdminTagsService],
  exports: [AdminTagsService],
})
export class AdminTagsModule {}
