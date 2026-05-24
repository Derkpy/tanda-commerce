-- AlterTable
ALTER TABLE "category" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "id_branch" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "code" VARCHAR(45) NOT NULL;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "id_branch" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tanda" ADD COLUMN     "id_client" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "id_branch" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "branch" (
    "id_branch" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "localitation" VARCHAR(180) NOT NULL,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id_branch")
);

-- CreateIndex
CREATE INDEX "group_id_branch_idx" ON "group"("id_branch");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "sales_id_branch_idx" ON "sales"("id_branch");

-- CreateIndex
CREATE INDEX "tanda_id_client_idx" ON "tanda"("id_client");

-- CreateIndex
CREATE INDEX "users_id_branch_idx" ON "users"("id_branch");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_branch_fkey" FOREIGN KEY ("id_branch") REFERENCES "branch"("id_branch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_id_branch_fkey" FOREIGN KEY ("id_branch") REFERENCES "branch"("id_branch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_id_branch_fkey" FOREIGN KEY ("id_branch") REFERENCES "branch"("id_branch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanda" ADD CONSTRAINT "tanda_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;
