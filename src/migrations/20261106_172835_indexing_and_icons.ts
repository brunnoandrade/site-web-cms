import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" ADD COLUMN "block_indexing" boolean DEFAULT false;
  ALTER TABLE "tenants" ADD COLUMN "robots_extra" varchar;
  ALTER TABLE "tenants" ADD COLUMN "seo_default_description" varchar;
  ALTER TABLE "tenants" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "tenants" ADD COLUMN "app_icon_id" integer;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_app_icon_id_media_id_fk" FOREIGN KEY ("app_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tenants_favicon_idx" ON "tenants" USING btree ("favicon_id");
  CREATE INDEX "tenants_app_icon_idx" ON "tenants" USING btree ("app_icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" DROP CONSTRAINT "tenants_favicon_id_media_id_fk";
  
  ALTER TABLE "tenants" DROP CONSTRAINT "tenants_app_icon_id_media_id_fk";
  
  DROP INDEX "tenants_favicon_idx";
  DROP INDEX "tenants_app_icon_idx";
  ALTER TABLE "tenants" DROP COLUMN "block_indexing";
  ALTER TABLE "tenants" DROP COLUMN "robots_extra";
  ALTER TABLE "tenants" DROP COLUMN "seo_default_description";
  ALTER TABLE "tenants" DROP COLUMN "favicon_id";
  ALTER TABLE "tenants" DROP COLUMN "app_icon_id";`)
}
