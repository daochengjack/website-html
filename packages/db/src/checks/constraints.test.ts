import { prisma } from '../index';

async function testSlugUniqueness() {
  console.log('Testing slug uniqueness constraints...');

  try {
    await prisma.productCategory.create({
      data: {
        slug: 'test-category',
        path: '/test-category',
      },
    });

    await prisma.productCategory.create({
      data: {
        slug: 'test-category',
        path: '/test-category-2',
      },
    });

    console.error('❌ FAILED: Duplicate slug was allowed');
    return false;
  } catch (error) {
    console.log('✅ PASSED: Duplicate slug was rejected');
    return true;
  } finally {
    await prisma.productCategory.deleteMany({
      where: { slug: 'test-category' },
    });
  }
}

async function testTranslationUniqueness() {
  console.log('Testing translation uniqueness constraints...');

  const category = await prisma.productCategory.create({
    data: {
      slug: 'test-trans-category',
      path: '/test-trans',
    },
  });

  try {
    await prisma.productCategoryTranslation.create({
      data: {
        categoryId: category.id,
        locale: 'en',
        name: 'Test Category',
      },
    });

    await prisma.productCategoryTranslation.create({
      data: {
        categoryId: category.id,
        locale: 'en',
        name: 'Test Category 2',
      },
    });

    console.error('❌ FAILED: Duplicate translation was allowed');
    return false;
  } catch (error) {
    console.log('✅ PASSED: Duplicate translation was rejected');
    return true;
  } finally {
    await prisma.productCategory.delete({ where: { id: category.id } });
  }
}

async function testCascadingDelete() {
  console.log('Testing cascading delete...');

  const category = await prisma.productCategory.create({
    data: {
      slug: 'test-cascade-category',
      path: '/test-cascade',
      translations: {
        create: [
          {
            locale: 'en',
            name: 'Test Category',
          },
          {
            locale: 'zh',
            name: '测试类别',
          },
        ],
      },
    },
  });

  await prisma.productCategory.delete({ where: { id: category.id } });

  const translations = await prisma.productCategoryTranslation.findMany({
    where: { categoryId: category.id },
  });

  if (translations.length > 0) {
    console.error('❌ FAILED: Translations were not cascaded');
    return false;
  }

  console.log('✅ PASSED: Translations were cascaded');
  return true;
}

async function testProductSlugUniquePerLocale() {
  console.log('Testing product slug uniqueness per locale...');

  await prisma.product.create({
    data: {
      sku: 'TEST-SKU-001',
      translations: {
        create: {
          locale: 'en',
          slug: 'test-product',
          name: 'Test Product',
        },
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: 'TEST-SKU-002',
    },
  });

  try {
    await prisma.productTranslation.create({
      data: {
        productId: product2.id,
        locale: 'en',
        slug: 'test-product',
        name: 'Test Product 2',
      },
    });

    console.error('❌ FAILED: Duplicate product slug per locale was allowed');
    await prisma.product.deleteMany({
      where: { sku: { in: ['TEST-SKU-001', 'TEST-SKU-002'] } },
    });
    return false;
  } catch (error) {
    console.log('✅ PASSED: Duplicate product slug per locale was rejected');
    await prisma.product.deleteMany({
      where: { sku: { in: ['TEST-SKU-001', 'TEST-SKU-002'] } },
    });
    return true;
  }
}

async function testProductRelatedUniqueness() {
  console.log('Testing product related uniqueness...');

  const product1 = await prisma.product.create({
    data: { sku: 'TEST-REL-001' },
  });

  const product2 = await prisma.product.create({
    data: { sku: 'TEST-REL-002' },
  });

  await prisma.productRelated.create({
    data: {
      productId: product1.id,
      relatedProductId: product2.id,
    },
  });

  try {
    await prisma.productRelated.create({
      data: {
        productId: product1.id,
        relatedProductId: product2.id,
      },
    });

    console.error('❌ FAILED: Duplicate product relation was allowed');
    await prisma.product.deleteMany({
      where: { sku: { in: ['TEST-REL-001', 'TEST-REL-002'] } },
    });
    return false;
  } catch (error) {
    console.log('✅ PASSED: Duplicate product relation was rejected');
    await prisma.product.deleteMany({
      where: { sku: { in: ['TEST-REL-001', 'TEST-REL-002'] } },
    });
    return true;
  }
}

async function runAllTests() {
  console.log('🧪 Running database constraint tests...\n');

  const results = await Promise.all([
    testSlugUniqueness(),
    testTranslationUniqueness(),
    testCascadingDelete(),
    testProductSlugUniquePerLocale(),
    testProductRelatedUniqueness(),
  ]);

  const passedCount = results.filter(Boolean).length;
  const totalCount = results.length;

  console.log(
    `\n${passedCount === totalCount ? '✅' : '❌'} ${passedCount}/${totalCount} tests passed`,
  );

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runAllTests()
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { runAllTests };
