import { Module } from '@nestjs/common';

import { AdminAssetsController } from './assets.controller';
import { AdminAssetsService } from './assets.service';

@Module({
  controllers: [AdminAssetsController],
  providers: [AdminAssetsService],
  exports: [AdminAssetsService],
})
export class AdminAssetsModule {}
