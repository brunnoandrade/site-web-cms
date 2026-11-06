import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tenants_socials_network" AS ENUM('instagram', 'linkedin', 'youtube', 'facebook', 'x', 'tiktok');
  CREATE TABLE "tenants_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_tenants_socials_network" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "tenants" ADD COLUMN "tracking_gtm_id" varchar;
  ALTER TABLE "tenants" ADD COLUMN "tracking_ga4_id" varchar;
  ALTER TABLE "tenants" ADD COLUMN "tracking_consent_banner" boolean DEFAULT false;
  ALTER TABLE "tenants" ADD COLUMN "tracking_privacy_url" varchar;
  ALTER TABLE "tenants" ADD COLUMN "company_legal_name" varchar;
  ALTER TABLE "tenants" ADD COLUMN "company_cnpj" varchar;
  ALTER TABLE "tenants" ADD COLUMN "company_address" varchar;
  ALTER TABLE "tenants" ADD COLUMN "company_sac_phone" varchar;
  ALTER TABLE "tenants_socials" ADD CONSTRAINT "tenants_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tenants_socials_order_idx" ON "tenants_socials" USING btree ("_order");
  CREATE INDEX "tenants_socials_parent_id_idx" ON "tenants_socials" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tenants_socials" CASCADE;
  ALTER TABLE "tenants" DROP COLUMN "tracking_gtm_id";
  ALTER TABLE "tenants" DROP COLUMN "tracking_ga4_id";
  ALTER TABLE "tenants" DROP COLUMN "tracking_consent_banner";
  ALTER TABLE "tenants" DROP COLUMN "tracking_privacy_url";
  ALTER TABLE "tenants" DROP COLUMN "company_legal_name";
  ALTER TABLE "tenants" DROP COLUMN "company_cnpj";
  ALTER TABLE "tenants" DROP COLUMN "company_address";
  ALTER TABLE "tenants" DROP COLUMN "company_sac_phone";
  DROP TYPE "public"."enum_tenants_socials_network";`)
}
