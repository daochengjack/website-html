import { Module } from '@nestjs/common';

import { AdminCategoriesModule } from './categories/categories.module';
import { AdminProductsModule } from './products/products.module';
import { AdminTagsModule } from './tags/tags.module';
import { AdminAssetsModule } from './assets/assets.module';

@Module({
  imports: [AdminCategoriesModule, AdminProductsModule, AdminTagsModule, AdminAssetsModule],
})
export class AdminModule {}
