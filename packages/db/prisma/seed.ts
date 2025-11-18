import { createHash } from 'crypto';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function derivePasswordHash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seeding...');

  const adminSeedPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const adminPasswordHash = derivePasswordHash(adminSeedPassword);

  console.log('📋 Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      slug: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      isSystem: true,
    },
  });

  await prisma.role.upsert({
    where: { slug: 'editor' },
    update: {},
    create: {
      slug: 'editor',
      name: 'Content Editor',
      description: 'Can create and edit content',
      isSystem: true,
    },
  });

  await prisma.role.upsert({
    where: { slug: 'viewer' },
    update: {},
    create: {
      slug: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      isSystem: true,
    },
  });

  console.log('👤 Seeding admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@csceramic.com' },
    update: {},
    create: {
      email: 'admin@csceramic.com',
      name: 'System Administrator',
      passwordHash: adminPasswordHash,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('🏷️ Seeding inquiry statuses...');
  const statuses = [
    { slug: 'new', name: 'New', color: '#3B82F6', position: 0 },
    { slug: 'in-progress', name: 'In Progress', color: '#F59E0B', position: 1 },
    { slug: 'awaiting-response', name: 'Awaiting Response', color: '#8B5CF6', position: 2 },
    { slug: 'resolved', name: 'Resolved', color: '#10B981', position: 3 },
    { slug: 'closed', name: 'Closed', color: '#6B7280', position: 4 },
  ];

  for (const status of statuses) {
    await prisma.inquiryStatus.upsert({
      where: { slug: status.slug },
      update: {},
      create: {
        slug: status.slug,
        name: status.name,
        description: `Inquiry status: ${status.name}`,
        color: status.color,
        position: status.position,
        isActive: true,
      },
    });
  }

  console.log('📁 Seeding product categories...');
  const rootCategory = await prisma.productCategory.upsert({
    where: { slug: 'ceramic-capacitors' },
    update: {},
    create: {
      slug: 'ceramic-capacitors',
      path: '/ceramic-capacitors',
      position: 0,
      isPublished: true,
      showInMenu: true,
    },
  });

  await prisma.productCategoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId: rootCategory.id,
        locale: 'en',
      },
    },
    update: {},
    create: {
      categoryId: rootCategory.id,
      locale: 'en',
      name: 'Ceramic Capacitors',
      description: 'High-quality ceramic capacitors for various applications',
      metaTitle: 'Ceramic Capacitors | CSCeramic',
      metaDescription: 'Browse our range of ceramic capacitors',
      isPublished: true,
    },
  });

  await prisma.productCategoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId: rootCategory.id,
        locale: 'zh',
      },
    },
    update: {},
    create: {
      categoryId: rootCategory.id,
      locale: 'zh',
      name: '陶瓷电容器',
      description: '用于各种应用的高质量陶瓷电容器',
      metaTitle: '陶瓷电容器 | 成都宏明',
      metaDescription: '浏览我们的陶瓷电容器系列',
      isPublished: true,
    },
  });

  const mlccCategory = await prisma.productCategory.upsert({
    where: { slug: 'mlcc' },
    update: {},
    create: {
      slug: 'mlcc',
      path: '/ceramic-capacitors/mlcc',
      parentId: rootCategory.id,
      position: 0,
      isPublished: true,
      showInMenu: true,
    },
  });

  await prisma.productCategoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId: mlccCategory.id,
        locale: 'en',
      },
    },
    update: {},
    create: {
      categoryId: mlccCategory.id,
      locale: 'en',
      name: 'MLCC (Multilayer Ceramic Capacitors)',
      description: 'Multilayer ceramic chip capacitors with high reliability',
      metaTitle: 'MLCC Capacitors | CSCeramic',
      metaDescription: 'High-quality multilayer ceramic capacitors',
      isPublished: true,
    },
  });

  await prisma.productCategoryTranslation.upsert({
    where: {
      categoryId_locale: {
        categoryId: mlccCategory.id,
        locale: 'zh',
      },
    },
    update: {},
    create: {
      categoryId: mlccCategory.id,
      locale: 'zh',
      name: 'MLCC（多层陶瓷电容器）',
      description: '具有高可靠性的多层陶瓷片式电容器',
      metaTitle: 'MLCC电容器 | 成都宏明',
      metaDescription: '高质量多层陶瓷电容器',
      isPublished: true,
    },
  });

  console.log('📦 Seeding example products...');
  const exampleProduct = await prisma.product.upsert({
    where: { sku: 'CC0805-100NF-50V' },
    update: {},
    create: {
      sku: 'CC0805-100NF-50V',
      categoryId: mlccCategory.id,
      status: 'PUBLISHED',
      isFeatured: true,
      position: 0,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.deleteMany({ where: { productId: exampleProduct.id } });
  await prisma.productSpecification.deleteMany({ where: { productId: exampleProduct.id } });

  await prisma.productTranslation.upsert({
    where: {
      productId_locale: {
        productId: exampleProduct.id,
        locale: 'en',
      },
    },
    update: {},
    create: {
      productId: exampleProduct.id,
      locale: 'en',
      slug: 'mlcc-0805-100nf-50v',
      name: 'MLCC 0805 100nF 50V',
      shortDescription: 'High-quality MLCC capacitor with X7R dielectric',
      description:
        'This multilayer ceramic capacitor offers excellent stability and reliability for a wide range of applications. With a capacitance of 100nF and voltage rating of 50V, it is ideal for power supply filtering, coupling, and decoupling applications.',
      features:
        '• X7R dielectric\n• Temperature range: -55°C to +125°C\n• RoHS compliant\n• AEC-Q200 qualified',
      applications: 'Suitable for automotive, industrial, and consumer electronics applications.',
      metaTitle: 'MLCC 0805 100nF 50V Ceramic Capacitor',
      metaDescription:
        'High-quality MLCC capacitor in 0805 package with 100nF capacitance and 50V rating',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.productTranslation.upsert({
    where: {
      productId_locale: {
        productId: exampleProduct.id,
        locale: 'zh',
      },
    },
    update: {},
    create: {
      productId: exampleProduct.id,
      locale: 'zh',
      slug: 'mlcc-0805-100nf-50v',
      name: 'MLCC 0805 100nF 50V',
      shortDescription: '采用X7R介电材料的高质量MLCC电容器',
      description:
        '这款多层陶瓷电容器为各种应用提供出色的稳定性和可靠性。容量为100nF，额定电压为50V，非常适合电源滤波、耦合和去耦应用。',
      features: '• X7R介电材料\n• 温度范围：-55°C至+125°C\n• 符合RoHS标准\n• 通过AEC-Q200认证',
      applications: '适用于汽车、工业和消费电子应用。',
      metaTitle: 'MLCC 0805 100nF 50V 陶瓷电容器',
      metaDescription: '0805封装的高质量MLCC电容器，容量100nF，额定电压50V',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.productImage.create({
    data: {
      productId: exampleProduct.id,
      url: '/images/products/mlcc-0805-placeholder.jpg',
      altText: 'MLCC 0805 Ceramic Capacitor',
      position: 0,
      isPrimary: true,
    },
  });

  const specifications = [
    { key: 'Capacitance', value: '100', unit: 'nF', position: 0 },
    { key: 'Voltage', value: '50', unit: 'V', position: 1 },
    { key: 'Tolerance', value: '±10', unit: '%', position: 2 },
    { key: 'Dielectric', value: 'X7R', unit: null, position: 3 },
    { key: 'Package', value: '0805', unit: null, position: 4 },
    { key: 'Temperature Range', value: '-55 to +125', unit: '°C', position: 5 },
  ];

  for (const spec of specifications) {
    await prisma.productSpecification.create({
      data: {
        productId: exampleProduct.id,
        key: spec.key,
        value: spec.value,
        unit: spec.unit,
        position: spec.position,
      },
    });
  }

  console.log('🏷️ Seeding product tags...');
  const tags = [
    { slug: 'automotive', names: { en: 'Automotive', zh: '汽车级' } },
    { slug: 'high-temp', names: { en: 'High Temperature', zh: '高温' } },
    { slug: 'rohs', names: { en: 'RoHS Compliant', zh: 'RoHS认证' } },
  ];

  for (const tag of tags) {
    const productTag = await prisma.productTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: {
        slug: tag.slug,
        isPublished: true,
      },
    });

    await prisma.productTagTranslation.upsert({
      where: {
        tagId_locale: {
          tagId: productTag.id,
          locale: 'en',
        },
      },
      update: {},
      create: {
        tagId: productTag.id,
        locale: 'en',
        name: tag.names.en,
        isPublished: true,
      },
    });

    await prisma.productTagTranslation.upsert({
      where: {
        tagId_locale: {
          tagId: productTag.id,
          locale: 'zh',
        },
      },
      update: {},
      create: {
        tagId: productTag.id,
        locale: 'zh',
        name: tag.names.zh,
        isPublished: true,
      },
    });

    await prisma.productTagOnProduct.upsert({
      where: {
        productId_tagId: {
          productId: exampleProduct.id,
          tagId: productTag.id,
        },
      },
      update: {},
      create: {
        productId: exampleProduct.id,
        tagId: productTag.id,
      },
    });
  }

  console.log('💼 Seeding client logos...');
  await prisma.clientLogo.deleteMany();
  const clientLogos = [
    { name: 'Client A', logoUrl: '/images/clients/client-a.png', position: 0 },
    { name: 'Client B', logoUrl: '/images/clients/client-b.png', position: 1 },
    { name: 'Client C', logoUrl: '/images/clients/client-c.png', position: 2 },
  ];

  for (const logo of clientLogos) {
    await prisma.clientLogo.create({
      data: {
        name: logo.name,
        logoUrl: logo.logoUrl,
        position: logo.position,
        isPublished: true,
      },
    });
  }

  console.log('📄 Seeding static pages...');
  const aboutPage = await prisma.staticPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      pageKey: 'about-us',
      isPublished: true,
    },
  });

  await prisma.staticPageTranslation.upsert({
    where: {
      pageId_locale: {
        pageId: aboutPage.id,
        locale: 'en',
      },
    },
    update: {},
    create: {
      pageId: aboutPage.id,
      locale: 'en',
      slug: 'about',
      title: 'About Us',
      content:
        '<h1>About CSCeramic</h1><p>We are a leading manufacturer of high-quality ceramic capacitors with over 20 years of experience in the industry.</p>',
      metaTitle: 'About Us | CSCeramic',
      metaDescription: 'Learn more about CSCeramic, a leading manufacturer of ceramic capacitors',
      isPublished: true,
    },
  });

  await prisma.staticPageTranslation.upsert({
    where: {
      pageId_locale: {
        pageId: aboutPage.id,
        locale: 'zh',
      },
    },
    update: {},
    create: {
      pageId: aboutPage.id,
      locale: 'zh',
      slug: 'about',
      title: '关于我们',
      content:
        '<h1>关于成都宏明</h1><p>我们是一家领先的高质量陶瓷电容器制造商，在该行业拥有超过20年的经验。</p>',
      metaTitle: '关于我们 | 成都宏明',
      metaDescription: '了解更多关于成都宏明，一家领先的陶瓷电容器制造商',
      isPublished: true,
    },
  });

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
