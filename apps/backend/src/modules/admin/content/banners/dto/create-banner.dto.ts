import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @IsString()
  locale: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  mobileImageUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  linkText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  startsAt?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  endsAt?: Date;
}