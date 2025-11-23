import { IsString, IsOptional, IsUrl, IsArray, MaxLength, IsBoolean } from 'class-validator';

export class CreateBlogPostTranslationDto {
  @IsString()
  locale: string;

  @IsString()
  slug: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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

export class CreateBlogPostDto {
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  featuredImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorName?: string;

  @IsArray()
  translations: CreateBlogPostTranslationDto[];
}