import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  position?: number;
}
