-- AlterTable
ALTER TABLE "client" ADD COLUMN     "id_branch" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price_product" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "username" VARCHAR(80) NOT NULL;

-- CreateTable
CREATE TABLE "refresh_token" (
    "id_refresh_token" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(60),
    "user_agent" VARCHAR(255),

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id_refresh_token")
);

-- CreateIndex
CREATE INDEX "refresh_token_id_user_idx" ON "refresh_token"("id_user");

-- CreateIndex
CREATE INDEX "refresh_token_expires_at_idx" ON "refresh_token"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "client_id_branch_idx" ON "client"("id_branch");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_id_branch_fkey" FOREIGN KEY ("id_branch") REFERENCES "branch"("id_branch") ON DELETE RESTRICT ON UPDATE CASCADE;
