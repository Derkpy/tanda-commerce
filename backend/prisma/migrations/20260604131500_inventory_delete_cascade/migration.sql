-- Make inventory parent deletions cascade to their inventory children.
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_id_category_fkey";
ALTER TABLE "products" ADD CONSTRAINT "products_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "category"("id_category") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "category_id_group_fkey";
ALTER TABLE "category" ADD CONSTRAINT "category_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "group"("id_group") ON DELETE CASCADE ON UPDATE CASCADE;
