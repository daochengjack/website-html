import { IsOptional, IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  showInMenu?: boolean;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  // Translation fields - for default/first translation
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsNotEmpty()
  name: string;

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
}
