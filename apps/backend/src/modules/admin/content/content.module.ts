import { Module } from '@nestjs/common';
import { AdminBannersController } from './banners/banners.controller';
import { AdminBannersService } from './banners/banners.service';
import { AdminHomepageController } from './homepage/homepage.controller';
import { AdminHomepageService } from './homepage/homepage.service';
import { AdminClientLogosController } from './client-logos/client-logos.controller';
import { AdminClientLogosService } from './client-logos/client-logos.service';
import { AdminTestimonialsController } from './testimonials/testimonials.controller';
import { AdminTestimonialsService } from './testimonials/testimonials.service';
import { AdminNewsController } from './news/news.controller';
import { AdminNewsService } from './news/news.service';
import { AdminBlogController } from './blog/blog.controller';
import { AdminBlogService } from './blog/blog.service';
import { AdminDownloadsController } from './downloads/downloads.controller';
import { AdminDownloadsService } from './downloads/downloads.service';
import { AdminPagesController } from './pages/pages.controller';
import { AdminPagesService } from './pages/pages.service';

@Module({
  controllers: [
    AdminBannersController,
    AdminHomepageController,
    AdminClientLogosController,
    AdminTestimonialsController,
    AdminNewsController,
    AdminBlogController,
    AdminDownloadsController,
    AdminPagesController,
  ],
  providers: [
    AdminBannersService,
    AdminHomepageService,
    AdminClientLogosService,
    AdminTestimonialsService,
    AdminNewsService,
    AdminBlogService,
    AdminDownloadsService,
    AdminPagesService,
  ],
  exports: [
    AdminBannersService,
    AdminHomepageService,
    AdminClientLogosService,
    AdminTestimonialsService,
    AdminNewsService,
    AdminBlogService,
    AdminDownloadsService,
    AdminPagesService,
  ],
})
export class AdminContentModule {}