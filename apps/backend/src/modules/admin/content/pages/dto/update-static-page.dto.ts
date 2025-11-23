import { PartialType } from '@nestjs/mapped-types';
import { CreateStaticPageDto, CreateStaticPageTranslationDto } from './create-static-page.dto';

export class UpdateStaticPageTranslationDto extends PartialType(CreateStaticPageTranslationDto) {}

export class UpdateStaticPageDto extends PartialType(CreateStaticPageDto) {
  @IsOptional()
  translations?: UpdateStaticPageTranslationDto[];
}