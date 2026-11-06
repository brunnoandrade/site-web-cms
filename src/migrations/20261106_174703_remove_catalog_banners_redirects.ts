import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_product_highlight" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rates_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_banner_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_product_highlight" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rates_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_banner_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rates_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "rates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_rates_v_version_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_rates_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "banners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "banners_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_product_highlight" CASCADE;
  DROP TABLE "pages_blocks_rates_table" CASCADE;
  DROP TABLE "pages_blocks_banner_section" CASCADE;
  DROP TABLE "_pages_v_blocks_product_highlight" CASCADE;
  DROP TABLE "_pages_v_blocks_rates_table" CASCADE;
  DROP TABLE "_pages_v_blocks_banner_section" CASCADE;
  DROP TABLE "products_benefits" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "rates_items" CASCADE;
  DROP TABLE "rates" CASCADE;
  DROP TABLE "_rates_v_version_items" CASCADE;
  DROP TABLE "_rates_v" CASCADE;
  DROP TABLE "banners" CASCADE;
  DROP TABLE "banners_rels" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_rates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_banners_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_redirects_fk";
  
  DROP INDEX "tenant_slug_5_idx";
  DROP INDEX "tenant_slug_6_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_rates_id_idx";
  DROP INDEX "payload_locked_documents_rels_banners_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  CREATE UNIQUE INDEX "tenant_slug_4_idx" ON "help_categories" USING btree ("tenant_id","slug");
  CREATE UNIQUE INDEX "tenant_slug_5_idx" ON "help_topics" USING btree ("tenant_id","slug");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "rates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "banners_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_pages_blocks_product_highlight_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_product_highlight_image_position";
  DROP TYPE "public"."enum_products_category";
  DROP TYPE "public"."enum_products_link_type";
  DROP TYPE "public"."enum_rates_items_kind";
  DROP TYPE "public"."enum_rates_items_period";
  DROP TYPE "public"."enum_rates_items_value_type";
  DROP TYPE "public"."enum_rates_status";
  DROP TYPE "public"."enum__rates_v_version_items_kind";
  DROP TYPE "public"."enum__rates_v_version_items_period";
  DROP TYPE "public"."enum__rates_v_version_items_value_type";
  DROP TYPE "public"."enum__rates_v_version_status";
  DROP TYPE "public"."enum_banners_link_type";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_redirects_wave";
  DROP TYPE "public"."enum_redirects_origin";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_product_highlight_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_product_highlight_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_products_category" AS ENUM('credit-card', 'account', 'loan', 'investment', 'insurance', 'other');
  CREATE TYPE "public"."enum_products_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_rates_items_kind" AS ENUM('interest', 'cet', 'fee', 'other');
  CREATE TYPE "public"."enum_rates_items_period" AS ENUM('monthly', 'yearly', 'once');
  CREATE TYPE "public"."enum_rates_items_value_type" AS ENUM('percent', 'currency');
  CREATE TYPE "public"."enum_rates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__rates_v_version_items_kind" AS ENUM('interest', 'cet', 'fee', 'other');
  CREATE TYPE "public"."enum__rates_v_version_items_period" AS ENUM('monthly', 'yearly', 'once');
  CREATE TYPE "public"."enum__rates_v_version_items_value_type" AS ENUM('percent', 'currency');
  CREATE TYPE "public"."enum__rates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_banners_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_redirects_wave" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_redirects_origin" AS ENUM('manual', 'auto', 'import');
  CREATE TABLE "pages_blocks_product_highlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"image_position" "enum_pages_blocks_product_highlight_image_position" DEFAULT 'right',
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rates_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rates_id" integer,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"banner_id" integer,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_highlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"image_position" "enum__pages_v_blocks_product_highlight_image_position" DEFAULT 'right',
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rates_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"rates_id" integer,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_id" integer,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"category" "enum_products_category" NOT NULL,
  	"summary" varchar NOT NULL,
  	"image_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum_products_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "rates_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_rates_items_kind",
  	"period" "enum_rates_items_period",
  	"value_type" "enum_rates_items_value_type" DEFAULT 'percent',
  	"value" numeric,
  	"value_max" numeric
  );
  
  CREATE TABLE "rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"product_id" integer,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"legal_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_rates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_rates_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__rates_v_version_items_kind",
  	"period" "enum__rates_v_version_items_period",
  	"value_type" "enum__rates_v_version_items_value_type" DEFAULT 'percent',
  	"value" numeric,
  	"value_max" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_rates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_product_id" integer,
  	"version_valid_from" timestamp(3) with time zone,
  	"version_valid_until" timestamp(3) with time zone,
  	"version_legal_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__rates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"mobile_image_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum_banners_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"active" boolean DEFAULT true,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "banners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" DEFAULT '301',
  	"destination_path" varchar,
  	"active" boolean DEFAULT true,
  	"wave" "enum_redirects_wave",
  	"origin" "enum_redirects_origin" DEFAULT 'manual',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  DROP INDEX "tenant_slug_4_idx";
  DROP INDEX "tenant_slug_5_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "rates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "banners_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rates_table" ADD CONSTRAINT "pages_blocks_rates_table_rates_id_rates_id_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rates_table" ADD CONSTRAINT "pages_blocks_rates_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_section" ADD CONSTRAINT "pages_blocks_banner_section_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_section" ADD CONSTRAINT "pages_blocks_banner_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_highlight" ADD CONSTRAINT "_pages_v_blocks_product_highlight_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_highlight" ADD CONSTRAINT "_pages_v_blocks_product_highlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rates_table" ADD CONSTRAINT "_pages_v_blocks_rates_table_rates_id_rates_id_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rates_table" ADD CONSTRAINT "_pages_v_blocks_rates_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner_section" ADD CONSTRAINT "_pages_v_blocks_banner_section_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner_section" ADD CONSTRAINT "_pages_v_blocks_banner_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_benefits" ADD CONSTRAINT "products_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates_items" ADD CONSTRAINT "rates_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rates" ADD CONSTRAINT "rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rates" ADD CONSTRAINT "rates_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rates_v_version_items" ADD CONSTRAINT "_rates_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_rates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_rates_v" ADD CONSTRAINT "_rates_v_parent_id_rates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rates_v" ADD CONSTRAINT "_rates_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_rates_v" ADD CONSTRAINT "_rates_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_product_highlight_order_idx" ON "pages_blocks_product_highlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_highlight_parent_id_idx" ON "pages_blocks_product_highlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_highlight_path_idx" ON "pages_blocks_product_highlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_highlight_product_idx" ON "pages_blocks_product_highlight" USING btree ("product_id");
  CREATE INDEX "pages_blocks_rates_table_order_idx" ON "pages_blocks_rates_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_rates_table_parent_id_idx" ON "pages_blocks_rates_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rates_table_path_idx" ON "pages_blocks_rates_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_rates_table_rates_idx" ON "pages_blocks_rates_table" USING btree ("rates_id");
  CREATE INDEX "pages_blocks_banner_section_order_idx" ON "pages_blocks_banner_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_section_parent_id_idx" ON "pages_blocks_banner_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_section_path_idx" ON "pages_blocks_banner_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_section_banner_idx" ON "pages_blocks_banner_section" USING btree ("banner_id");
  CREATE INDEX "_pages_v_blocks_product_highlight_order_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_highlight_parent_id_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_highlight_path_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_highlight_product_idx" ON "_pages_v_blocks_product_highlight" USING btree ("product_id");
  CREATE INDEX "_pages_v_blocks_rates_table_order_idx" ON "_pages_v_blocks_rates_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rates_table_parent_id_idx" ON "_pages_v_blocks_rates_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rates_table_path_idx" ON "_pages_v_blocks_rates_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rates_table_rates_idx" ON "_pages_v_blocks_rates_table" USING btree ("rates_id");
  CREATE INDEX "_pages_v_blocks_banner_section_order_idx" ON "_pages_v_blocks_banner_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_section_parent_id_idx" ON "_pages_v_blocks_banner_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_section_path_idx" ON "_pages_v_blocks_banner_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_section_banner_idx" ON "_pages_v_blocks_banner_section" USING btree ("banner_id");
  CREATE INDEX "products_benefits_order_idx" ON "products_benefits" USING btree ("_order");
  CREATE INDEX "products_benefits_parent_id_idx" ON "products_benefits" USING btree ("_parent_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_image_idx" ON "products" USING btree ("image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_4_idx" ON "products" USING btree ("tenant_id","slug");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
  CREATE INDEX "products_rels_posts_id_idx" ON "products_rels" USING btree ("posts_id");
  CREATE INDEX "rates_items_order_idx" ON "rates_items" USING btree ("_order");
  CREATE INDEX "rates_items_parent_id_idx" ON "rates_items" USING btree ("_parent_id");
  CREATE INDEX "rates_tenant_idx" ON "rates" USING btree ("tenant_id");
  CREATE INDEX "rates_product_idx" ON "rates" USING btree ("product_id");
  CREATE INDEX "rates_updated_at_idx" ON "rates" USING btree ("updated_at");
  CREATE INDEX "rates_created_at_idx" ON "rates" USING btree ("created_at");
  CREATE INDEX "rates__status_idx" ON "rates" USING btree ("_status");
  CREATE INDEX "_rates_v_version_items_order_idx" ON "_rates_v_version_items" USING btree ("_order");
  CREATE INDEX "_rates_v_version_items_parent_id_idx" ON "_rates_v_version_items" USING btree ("_parent_id");
  CREATE INDEX "_rates_v_parent_idx" ON "_rates_v" USING btree ("parent_id");
  CREATE INDEX "_rates_v_version_version_tenant_idx" ON "_rates_v" USING btree ("version_tenant_id");
  CREATE INDEX "_rates_v_version_version_product_idx" ON "_rates_v" USING btree ("version_product_id");
  CREATE INDEX "_rates_v_version_version_updated_at_idx" ON "_rates_v" USING btree ("version_updated_at");
  CREATE INDEX "_rates_v_version_version_created_at_idx" ON "_rates_v" USING btree ("version_created_at");
  CREATE INDEX "_rates_v_version_version__status_idx" ON "_rates_v" USING btree ("version__status");
  CREATE INDEX "_rates_v_created_at_idx" ON "_rates_v" USING btree ("created_at");
  CREATE INDEX "_rates_v_updated_at_idx" ON "_rates_v" USING btree ("updated_at");
  CREATE INDEX "_rates_v_latest_idx" ON "_rates_v" USING btree ("latest");
  CREATE INDEX "banners_tenant_idx" ON "banners" USING btree ("tenant_id");
  CREATE INDEX "banners_image_idx" ON "banners" USING btree ("image_id");
  CREATE INDEX "banners_mobile_image_idx" ON "banners" USING btree ("mobile_image_id");
  CREATE INDEX "banners_updated_at_idx" ON "banners" USING btree ("updated_at");
  CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");
  CREATE INDEX "banners_rels_order_idx" ON "banners_rels" USING btree ("order");
  CREATE INDEX "banners_rels_parent_idx" ON "banners_rels" USING btree ("parent_id");
  CREATE INDEX "banners_rels_path_idx" ON "banners_rels" USING btree ("path");
  CREATE INDEX "banners_rels_pages_id_idx" ON "banners_rels" USING btree ("pages_id");
  CREATE INDEX "banners_rels_posts_id_idx" ON "banners_rels" USING btree ("posts_id");
  CREATE INDEX "redirects_tenant_idx" ON "redirects" USING btree ("tenant_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_destination_path_idx" ON "redirects" USING btree ("destination_path");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_from_idx" ON "redirects" USING btree ("tenant_id","from");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rates_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tenant_slug_5_idx" ON "help_categories" USING btree ("tenant_id","slug");
  CREATE UNIQUE INDEX "tenant_slug_6_idx" ON "help_topics" USING btree ("tenant_id","slug");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("rates_id");
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}
