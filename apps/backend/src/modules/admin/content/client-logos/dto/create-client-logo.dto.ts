import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientLogoDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsUrl()
  logoUrl: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}