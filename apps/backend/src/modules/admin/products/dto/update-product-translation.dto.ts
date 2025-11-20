import { IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateProductTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

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
