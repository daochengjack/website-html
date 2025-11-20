import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogPostDto, CreateBlogPostTranslationDto } from './create-blog-post.dto';

export class UpdateBlogPostTranslationDto extends PartialType(CreateBlogPostTranslationDto) {}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {
  @IsOptional()
  translations?: UpdateBlogPostTranslationDto[];
}