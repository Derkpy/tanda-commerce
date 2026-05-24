-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "role" VARCHAR(45) NOT NULL DEFAULT 'admin',
    "status" VARCHAR(45) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "client" (
    "id_client" SERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "status_singular" VARCHAR(45),
    "status_global" VARCHAR(45),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "sales" (
    "id_sales" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id_sales")
);

-- CreateTable
CREATE TABLE "sale_details" (
    "id_sale_details" SERIAL NOT NULL,
    "id_sale" INTEGER NOT NULL,
    "id_product" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "sale_details_pkey" PRIMARY KEY ("id_sale_details")
);

-- CreateTable
CREATE TABLE "group" (
    "id_group" SERIAL NOT NULL,
    "group_name" VARCHAR(80) NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id_group")
);

-- CreateTable
CREATE TABLE "category" (
    "id_category" SERIAL NOT NULL,
    "id_group" INTEGER NOT NULL,
    "category_name" VARCHAR(80) NOT NULL,
    "code" VARCHAR(45),

    CONSTRAINT "category_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "products" (
    "id_product" SERIAL NOT NULL,
    "id_category" INTEGER NOT NULL,
    "name_products" VARCHAR(120) NOT NULL,
    "price_product" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id_product")
);

-- CreateTable
CREATE TABLE "tanda" (
    "id_tanda" SERIAL NOT NULL,
    "id_sale" INTEGER NOT NULL,
    "date_end" DATE NOT NULL,
    "date_start" DATE NOT NULL,
    "status" VARCHAR(45) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "tanda_pkey" PRIMARY KEY ("id_tanda")
);

-- CreateTable
CREATE TABLE "payment_tanda" (
    "id_payment_tanda" SERIAL NOT NULL,
    "id_tanda" INTEGER NOT NULL,
    "status" VARCHAR(45) NOT NULL,
    "payment_date" DATE NOT NULL,
    "paid_date" DATE,
    "payment_total" DECIMAL(12,2) NOT NULL,
    "paid_total" DECIMAL(12,2),
    "payment_tanda_total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "payment_tanda_pkey" PRIMARY KEY ("id_payment_tanda")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sales_id_client_idx" ON "sales"("id_client");

-- CreateIndex
CREATE INDEX "sale_details_id_sale_idx" ON "sale_details"("id_sale");

-- CreateIndex
CREATE INDEX "sale_details_id_product_idx" ON "sale_details"("id_product");

-- CreateIndex
CREATE UNIQUE INDEX "category_code_key" ON "category"("code");

-- CreateIndex
CREATE INDEX "category_id_group_idx" ON "category"("id_group");

-- CreateIndex
CREATE INDEX "products_id_category_idx" ON "products"("id_category");

-- CreateIndex
CREATE UNIQUE INDEX "tanda_id_sale_key" ON "tanda"("id_sale");

-- CreateIndex
CREATE INDEX "payment_tanda_id_tanda_idx" ON "payment_tanda"("id_tanda");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_id_sale_fkey" FOREIGN KEY ("id_sale") REFERENCES "sales"("id_sales") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "products"("id_product") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "group"("id_group") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "category"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanda" ADD CONSTRAINT "tanda_id_sale_fkey" FOREIGN KEY ("id_sale") REFERENCES "sales"("id_sales") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_tanda" ADD CONSTRAINT "payment_tanda_id_tanda_fkey" FOREIGN KEY ("id_tanda") REFERENCES "tanda"("id_tanda") ON DELETE RESTRICT ON UPDATE CASCADE;
