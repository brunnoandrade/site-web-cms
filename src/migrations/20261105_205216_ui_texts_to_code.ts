import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tenants_ui_texts_popular_searches" CASCADE;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "read_more_label" varchar;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "read_more_label" varchar;
  ALTER TABLE "tenants" DROP CONSTRAINT "tenants_app_organization_logo_id_media_id_fk";
  DROP INDEX "tenants_app_app_organization_logo_idx";
  ALTER TABLE "tenants" DROP COLUMN "app_name";
  ALTER TABLE "tenants" DROP COLUMN "app_android_url";
  ALTER TABLE "tenants" DROP COLUMN "app_ios_url";
  ALTER TABLE "tenants" DROP COLUMN "app_organization_logo_id";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_read_more_blog";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_related_questions";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_help_title";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_crumb_home";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_crumb_help";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_search_page_title";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_search_suggestions";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_search_no_results";
  ALTER TABLE "tenants" DROP COLUMN "ui_texts_search_clear";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // The texts that moved to the code are not restored (they matched the code defaults).
  await db.execute(sql`
   CREATE TABLE "tenants_ui_texts_popular_searches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  ALTER TABLE "tenants" ADD COLUMN "app_name" varchar;
  ALTER TABLE "tenants" ADD COLUMN "app_android_url" varchar;
  ALTER TABLE "tenants" ADD COLUMN "app_ios_url" varchar;
  ALTER TABLE "tenants" ADD COLUMN "app_organization_logo_id" integer;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_app_organization_logo_id_media_id_fk" FOREIGN KEY ("app_organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tenants_app_app_organization_logo_idx" ON "tenants" USING btree ("app_organization_logo_id");
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_read_more_blog" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_related_questions" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_help_title" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_crumb_home" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_crumb_help" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_search_page_title" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_search_suggestions" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_search_no_results" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ui_texts_search_clear" varchar;
  ALTER TABLE "tenants_ui_texts_popular_searches" ADD CONSTRAINT "tenants_ui_texts_popular_searches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tenants_ui_texts_popular_searches_order_idx" ON "tenants_ui_texts_popular_searches" USING btree ("_order");
  CREATE INDEX "tenants_ui_texts_popular_searches_parent_id_idx" ON "tenants_ui_texts_popular_searches" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "read_more_label";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "read_more_label";
`)
}
