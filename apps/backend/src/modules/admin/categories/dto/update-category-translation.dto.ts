import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateCategoryTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

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
