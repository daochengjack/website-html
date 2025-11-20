import { IsOptional, IsString, IsNotEmpty, IsEnum, IsBoolean, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class ProductTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  features?: string;

  @IsString()
  @IsOptional()
  applications?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  ogImage?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsNumber()
  @IsOptional()
  position?: number;

  @ValidateNested()
  @Type(() => ProductTranslationDto)
  translation: ProductTranslationDto;
}
