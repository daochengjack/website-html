import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHomepageSectionDto {
  @IsString()
  locale: string;

  @IsString()
  sectionKey: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}