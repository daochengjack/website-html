import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AdminAssetsService } from './assets.service';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { UploadImageDto } from './dto/upload-image.dto';

@Controller('admin/assets')
export class AdminAssetsController {
  constructor(private readonly assetsService: AdminAssetsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  async uploadAsset(@Body(ValidationPipe) dto: UploadAssetDto) {
    return this.assetsService.uploadAsset(dto);
  }

  @Post('images/upload')
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(@Body(ValidationPipe) dto: UploadImageDto) {
    return this.assetsService.uploadImage(dto);
  }

  @Get('products/:productId')
  async getAssets(@Param('productId') productId: string) {
    return this.assetsService.getAssets(productId);
  }

  @Delete('assets/:assetId')
  async deleteAsset(@Param('assetId') assetId: string) {
    return this.assetsService.deleteAsset(assetId);
  }

  @Delete('images/:imageId')
  async deleteImage(@Param('imageId') imageId: string) {
    return this.assetsService.deleteImage(imageId);
  }

  @Post('images/:productId/reorder')
  async updateImageOrder(
    @Param('productId') productId: string,
    @Body(ValidationPipe) body: { imageIds: string[] },
  ) {
    return this.assetsService.updateImageOrder(productId, body.imageIds);
  }

  @Post('assets/:productId/reorder')
  async updateAssetOrder(
    @Param('productId') productId: string,
    @Body(ValidationPipe) body: { assetIds: string[] },
  ) {
    return this.assetsService.updateAssetOrder(productId, body.assetIds);
  }
}
