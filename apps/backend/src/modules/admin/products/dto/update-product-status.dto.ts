import { IsEnum, IsNotEmpty } from 'class-validator';

enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateProductStatusDto {
  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status: ProductStatus;
}
