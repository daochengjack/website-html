-- AddUniqueConstraint to prevent duplicate FAQs per product-locale combination
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_productId_locale_key" UNIQUE ("productId", "locale");
