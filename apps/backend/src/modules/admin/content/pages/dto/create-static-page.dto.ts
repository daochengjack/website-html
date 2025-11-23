import { IsString, IsOptional, IsUrl, IsArray, MaxLength, IsBoolean } from 'class-validator';

export class CreateStaticPageTranslationDto {
  @IsString()
  locale: string;

  @IsString()
  slug: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  ogImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateStaticPageDto {
  @IsString()
  slug: string;

  @IsString()
  pageKey: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  translations: CreateStaticPageTranslationDto[];
}