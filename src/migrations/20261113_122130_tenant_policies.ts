import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tenants_help_style" AS ENUM('topics', 'flat');
  ALTER TABLE "tenants" ADD COLUMN "theme_color" varchar;
  ALTER TABLE "tenants" ADD COLUMN "help_style" "enum_tenants_help_style" DEFAULT 'topics';
  ALTER TABLE "tenants" ADD COLUMN "locale" varchar DEFAULT 'pt-BR';
  ALTER TABLE "tenants" ADD COLUMN "app_name" varchar;
  ALTER TABLE "tenants" ADD COLUMN "app_android_url" varchar;
  ALTER TABLE "tenants" ADD COLUMN "app_ios_url" varchar;

  -- What was fixed in the code for Uber Conta (src/lib/jsonld.ts, themes.ts, uber-help.ts) now
  -- lives in the property, so existing databases keep behaving the same.
  UPDATE "tenants" SET
    "theme_color" = '#000000',
    "help_style" = 'flat',
    "app_name" = 'Uber Conta',
    "app_android_url" = 'https://play.google.com/store/apps/details?id=br.com.digio.uber',
    "app_ios_url" = 'http://apps.apple.com/us/app/uber-conta/id1550784531'
  WHERE "slug" = 'uber-conta';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" DROP COLUMN "theme_color";
  ALTER TABLE "tenants" DROP COLUMN "help_style";
  ALTER TABLE "tenants" DROP COLUMN "locale";
  ALTER TABLE "tenants" DROP COLUMN "app_name";
  ALTER TABLE "tenants" DROP COLUMN "app_android_url";
  ALTER TABLE "tenants" DROP COLUMN "app_ios_url";
  DROP TYPE "public"."enum_tenants_help_style";`)
}
