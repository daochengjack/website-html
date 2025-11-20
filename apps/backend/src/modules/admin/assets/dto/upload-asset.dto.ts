import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class UploadAssetDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
