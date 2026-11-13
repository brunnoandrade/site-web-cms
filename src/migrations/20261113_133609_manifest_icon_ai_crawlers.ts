import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" ADD COLUMN "block_ai_crawlers" boolean DEFAULT false;
  ALTER TABLE "tenants" ADD COLUMN "manifest_icon_id" integer;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_manifest_icon_id_media_id_fk" FOREIGN KEY ("manifest_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tenants_manifest_icon_idx" ON "tenants" USING btree ("manifest_icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" DROP CONSTRAINT "tenants_manifest_icon_id_media_id_fk";
  
  DROP INDEX "tenants_manifest_icon_idx";
  ALTER TABLE "tenants" DROP COLUMN "block_ai_crawlers";
  ALTER TABLE "tenants" DROP COLUMN "manifest_icon_id";`)
}
