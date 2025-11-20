import { Controller, Get, Query, Param, ValidationPipe } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CatalogService } from './catalog.service';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Controller('catalog')
@Public()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  async getCategories(@Query(new ValidationPipe({ transform: true })) query: QueryCategoriesDto) {
    return this.catalogService.getCategoryTree(query.locale);
  }

  @Get('categories/:slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query(new ValidationPipe({ transform: true })) query: QueryCategoriesDto,
  ) {
    return this.catalogService.getCategoryBySlug(slug, query.locale);
  }

  @Get('products')
  async getProducts(@Query(new ValidationPipe({ transform: true })) query: QueryProductsDto) {
    return this.catalogService.getProducts(query);
  }

  @Get('products/hot')
  async getHotProducts(@Query('locale') locale = 'en', @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.catalogService.getHotProducts(locale, parsedLimit);
  }
}
