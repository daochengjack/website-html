import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsArticleDto, CreateNewsArticleTranslationDto } from './create-news-article.dto';

export class UpdateNewsArticleTranslationDto extends PartialType(CreateNewsArticleTranslationDto) {}

export class UpdateNewsArticleDto extends PartialType(CreateNewsArticleDto) {
  @IsOptional()
  translations?: UpdateNewsArticleTranslationDto[];
}