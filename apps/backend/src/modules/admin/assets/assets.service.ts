import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/db';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class AdminAssetsService {
  async uploadAsset(dto: UploadAssetDto) {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    return prisma.productAsset.create({
      data: {
        productId: dto.productId,
        type: dto.type,
        url: dto.url,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        title: dto.title,
        locale: dto.locale,
        position: dto.position ?? 0,
      },
    });
  }

  async uploadImage(dto: UploadImageDto) {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // If this is the primary image, unset any existing primary image
    if (dto.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: dto.productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.productImage.create({
      data: {
        productId: dto.productId,
        url: dto.url,
        altText: dto.altText,
        isPrimary: dto.isPrimary ?? false,
        position: dto.position ?? 0,
      },
    });
  }

  async getAssets(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      images: await prisma.productImage.findMany({
        where: { productId },
        orderBy: { position: 'asc' },
      }),
      assets: await prisma.productAsset.findMany({
        where: { productId },
        orderBy: { position: 'asc' },
      }),
    };
  }

  async deleteAsset(assetId: string) {
    const asset = await prisma.productAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    return prisma.productAsset.delete({
      where: { id: assetId },
    });
  }

  async deleteImage(imageId: string) {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    return prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async updateImageOrder(productId: string, imageIds: string[]) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const updates = imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { position: index },
      }),
    );

    await Promise.all(updates);

    return { success: true, message: 'Images reordered successfully' };
  }

  async updateAssetOrder(productId: string, assetIds: string[]) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const updates = assetIds.map((id, index) =>
      prisma.productAsset.update({
        where: { id },
        data: { position: index },
      }),
    );

    await Promise.all(updates);

    return { success: true, message: 'Assets reordered successfully' };
  }
}
