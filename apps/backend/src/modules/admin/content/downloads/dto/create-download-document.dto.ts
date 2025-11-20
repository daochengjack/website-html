import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDownloadDocumentDto {
  @IsString()
  locale: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  categoryKey?: string;

  @IsString()
  @IsUrl()
  fileUrl: string;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}