import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_icon" AS ENUM('credit-card', 'qr-code', 'wallet', 'piggy-bank', 'banknote', 'receipt', 'smartphone', 'shield-check', 'car', 'percent', 'gift', 'arrow-left-right', 'clock', 'landmark');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_background" AS ENUM('navy', 'blue', 'lilac', 'white');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cards_variant" AS ENUM('simple', 'feature', 'product', 'icon', 'benefits', 'shortcut');
  CREATE TYPE "public"."enum_pages_blocks_cards_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_cards_section_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_media_block_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum_pages_blocks_product_highlight_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_faq_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_faq_variant" AS ENUM('list', 'cards');
  CREATE TYPE "public"."enum_pages_blocks_faq_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_steps_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_steps_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_image_content_variant" AS ENUM('card', 'section');
  CREATE TYPE "public"."enum_pages_blocks_image_content_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_image_content_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_partner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_contacts_groups_entries_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_contacts_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_documents_groups_items_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_archive_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum_pages_blocks_archive_variant" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_pages_blocks_archive_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'noHero', 'landing');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'brand', 'fullscreen', 'cover', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_hero_tone" AS ENUM('onDark', 'onLight');
  CREATE TYPE "public"."enum_pages_hero_size" AS ENUM('full', 'half');
  CREATE TYPE "public"."enum_pages_hero_disclaimer_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_items_icon" AS ENUM('credit-card', 'qr-code', 'wallet', 'piggy-bank', 'banknote', 'receipt', 'smartphone', 'shield-check', 'car', 'percent', 'gift', 'arrow-left-right', 'clock', 'landmark');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_items_background" AS ENUM('navy', 'blue', 'lilac', 'white');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_variant" AS ENUM('simple', 'feature', 'product', 'icon', 'benefits', 'shortcut');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_section_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_background" AS ENUM('white', 'grey');
  CREATE TYPE "public"."enum__pages_v_blocks_product_highlight_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_variant" AS ENUM('list', 'cards');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_image_content_variant" AS ENUM('card', 'section');
  CREATE TYPE "public"."enum__pages_v_blocks_image_content_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_image_content_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_partner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_contacts_groups_entries_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_contacts_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_documents_groups_items_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_theme" AS ENUM('light', 'lilac', 'navy', 'blue');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_variant" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_more_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_template" AS ENUM('default', 'noHero', 'landing');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'brand', 'fullscreen', 'cover', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_hero_tone" AS ENUM('onDark', 'onLight');
  CREATE TYPE "public"."enum__pages_v_version_hero_size" AS ENUM('full', 'half');
  CREATE TYPE "public"."enum__pages_v_version_hero_disclaimer_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
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
  CREATE TYPE "public"."enum_help_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__help_topics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_banners_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_mega_groups_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_kind" AS ENUM('link', 'mega');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_cta_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_tenants_theme_preset" AS ENUM('digio', 'uber-conta');
  CREATE TYPE "public"."enum_tenants_layout" AS ENUM('digio', 'uber-conta');
  CREATE TYPE "public"."enum_tenants_blog_url_style" AS ENUM('category', 'flat');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'preview');
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('admin', 'editor', 'seo');
  CREATE TYPE "public"."enum_users_auth_provider" AS ENUM('local', 'sso');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_redirects_wave" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_redirects_origin" AS ENUM('manual', 'auto', 'import');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_content_theme" DEFAULT 'light',
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"icon" "enum_pages_blocks_cards_items_icon",
  	"background" "enum_pages_blocks_cards_items_background" DEFAULT 'navy',
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_cards_variant" DEFAULT 'simple',
  	"theme" "enum_pages_blocks_cards_theme" DEFAULT 'light',
  	"heading" varchar,
  	"intro" varchar,
  	"video_id" integer,
  	"video_mobile_id" integer,
  	"image_id" integer,
  	"background_image_id" integer,
  	"background_image_mobile_id" integer,
  	"legend" varchar,
  	"list_heading" varchar,
  	"columns" "enum_pages_blocks_cards_columns" DEFAULT '3',
  	"enable_section_link" boolean,
  	"section_link_type" "enum_pages_blocks_cards_section_link_type" DEFAULT 'reference',
  	"section_link_new_tab" boolean,
  	"section_link_url" varchar,
  	"section_link_label" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_cta_theme" DEFAULT 'light',
  	"rich_text" jsonb,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"media_mobile_id" integer,
  	"background" "enum_pages_blocks_media_block_background" DEFAULT 'white',
  	"anchor" varchar,
  	"block_name" varchar
  );
  
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
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_faq_theme" DEFAULT 'light',
  	"variant" "enum_pages_blocks_faq_variant" DEFAULT 'list',
  	"heading" varchar,
  	"enable_more_link" boolean,
  	"more_link_type" "enum_pages_blocks_faq_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_url" varchar,
  	"more_link_label" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"image_mobile_id" integer
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_steps_theme" DEFAULT 'navy',
  	"heading" varchar,
  	"intro" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_steps_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_content_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_image_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_image_content_variant" DEFAULT 'card',
  	"theme" "enum_pages_blocks_image_content_theme" DEFAULT 'navy',
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"logo_id" integer,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_image_content_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"legend" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_partner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_partner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"video_id" integer,
  	"video_mobile_id" integer,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_story_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"period" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contacts_groups_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"phone" varchar,
  	"icon_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_contacts_groups_entries_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_contacts_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_contacts_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_documents_groups_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_documents_groups_items_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_documents_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon_id" integer
  );
  
  CREATE TABLE "pages_blocks_documents_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_testimonials_theme" DEFAULT 'blue',
  	"heading" varchar,
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
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_archive_theme" DEFAULT 'light',
  	"variant" "enum_pages_blocks_archive_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"feed_url" varchar,
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"enable_more_link" boolean,
  	"more_link_type" "enum_pages_blocks_archive_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_url" varchar,
  	"more_link_label" varchar,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"template" "enum_pages_template" DEFAULT 'default',
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"hero_tone" "enum_pages_hero_tone" DEFAULT 'onDark',
  	"hero_size" "enum_pages_hero_size" DEFAULT 'full',
  	"hero_search_placeholder" varchar,
  	"hero_logo_id" integer,
  	"hero_media_mobile_id" integer,
  	"hero_video_id" integer,
  	"hero_video_mobile_id" integer,
  	"hero_poster_id" integer,
  	"hero_poster_mobile_id" integer,
  	"hero_disclaimer" varchar,
  	"hero_disclaimer_link_type" "enum_pages_hero_disclaimer_link_type" DEFAULT 'reference',
  	"hero_disclaimer_link_new_tab" boolean,
  	"hero_disclaimer_link_url" varchar,
  	"hero_disclaimer_link_label" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"faqs_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_content_theme" DEFAULT 'light',
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"icon" "enum__pages_v_blocks_cards_items_icon",
  	"background" "enum__pages_v_blocks_cards_items_background" DEFAULT 'navy',
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_cards_variant" DEFAULT 'simple',
  	"theme" "enum__pages_v_blocks_cards_theme" DEFAULT 'light',
  	"heading" varchar,
  	"intro" varchar,
  	"video_id" integer,
  	"video_mobile_id" integer,
  	"image_id" integer,
  	"background_image_id" integer,
  	"background_image_mobile_id" integer,
  	"legend" varchar,
  	"list_heading" varchar,
  	"columns" "enum__pages_v_blocks_cards_columns" DEFAULT '3',
  	"enable_section_link" boolean,
  	"section_link_type" "enum__pages_v_blocks_cards_section_link_type" DEFAULT 'reference',
  	"section_link_new_tab" boolean,
  	"section_link_url" varchar,
  	"section_link_label" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_cta_theme" DEFAULT 'light',
  	"rich_text" jsonb,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"media_mobile_id" integer,
  	"background" "enum__pages_v_blocks_media_block_background" DEFAULT 'white',
  	"anchor" varchar,
  	"_uuid" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_faq_theme" DEFAULT 'light',
  	"variant" "enum__pages_v_blocks_faq_variant" DEFAULT 'list',
  	"heading" varchar,
  	"enable_more_link" boolean,
  	"more_link_type" "enum__pages_v_blocks_faq_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_url" varchar,
  	"more_link_label" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_steps_theme" DEFAULT 'navy',
  	"heading" varchar,
  	"intro" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_steps_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_content_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_image_content_variant" DEFAULT 'card',
  	"theme" "enum__pages_v_blocks_image_content_theme" DEFAULT 'navy',
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"logo_id" integer,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_image_content_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"legend" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_partner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_partner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"video_id" integer,
  	"video_mobile_id" integer,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_mobile_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"period" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contacts_groups_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"phone" varchar,
  	"icon_id" integer,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_contacts_groups_entries_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contacts_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_contacts_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_groups_items_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_documents_groups_items_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_testimonials_theme" DEFAULT 'blue',
  	"heading" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_archive_theme" DEFAULT 'light',
  	"variant" "enum__pages_v_blocks_archive_variant" DEFAULT 'grid',
  	"eyebrow" varchar,
  	"feed_url" varchar,
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"enable_more_link" boolean,
  	"more_link_type" "enum__pages_v_blocks_archive_more_link_type" DEFAULT 'reference',
  	"more_link_new_tab" boolean,
  	"more_link_url" varchar,
  	"more_link_label" varchar,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_template" "enum__pages_v_version_template" DEFAULT 'default',
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_hero_tone" "enum__pages_v_version_hero_tone" DEFAULT 'onDark',
  	"version_hero_size" "enum__pages_v_version_hero_size" DEFAULT 'full',
  	"version_hero_search_placeholder" varchar,
  	"version_hero_logo_id" integer,
  	"version_hero_media_mobile_id" integer,
  	"version_hero_video_id" integer,
  	"version_hero_video_mobile_id" integer,
  	"version_hero_poster_id" integer,
  	"version_hero_poster_mobile_id" integer,
  	"version_hero_disclaimer" varchar,
  	"version_hero_disclaimer_link_type" "enum__pages_v_version_hero_disclaimer_link_type" DEFAULT 'reference',
  	"version_hero_disclaimer_link_new_tab" boolean,
  	"version_hero_disclaimer_link_url" varchar,
  	"version_hero_disclaimer_link_label" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_keywords" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"faqs_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"category_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_keywords" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"wp_id" numeric,
  	"wp_modified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"authors_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_category_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_keywords" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_wp_id" numeric,
  	"version_wp_modified_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"authors_id" integer
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"wp_id" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"bio" varchar,
  	"avatar_id" integer,
  	"wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"alt" varchar,
  	"caption" jsonb,
  	"wp_id" numeric,
  	"wp_source_url" varchar,
  	"prefix" varchar DEFAULT 'tenants',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
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
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"question" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"answer" jsonb NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"category_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "help_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"icon_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "help_topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"category_id" integer,
  	"order" numeric DEFAULT 0,
  	"summary" varchar,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_help_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "help_topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_help_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__help_topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_help_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
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
  
  CREATE TABLE "header_nav_items_mega_groups_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_mega_groups_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "header_nav_items_mega_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_header_nav_items_kind" DEFAULT 'link',
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"mega_label" varchar,
  	"mega_title" varchar,
  	"mega_description" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"enable_cta" boolean,
  	"cta_type" "enum_header_cta_type" DEFAULT 'reference',
  	"cta_new_tab" boolean,
  	"cta_url" varchar,
  	"cta_label" varchar,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"logo_id" integer,
  	"logo_mobile_id" integer,
  	"highlight_image_id" integer,
  	"legal_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "tenants_ui_texts_popular_searches" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "tenants_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"site_url" varchar NOT NULL,
  	"theme_preset" "enum_tenants_theme_preset" DEFAULT 'digio',
  	"layout" "enum_tenants_layout" DEFAULT 'digio',
  	"trailing_slash" boolean DEFAULT true,
  	"blog_url_style" "enum_tenants_blog_url_style" DEFAULT 'category',
  	"seo_title_suffix" varchar,
  	"seo_default_image_id" integer,
  	"llms_txt" varchar,
  	"ui_texts_read_more_blog" varchar,
  	"ui_texts_related_questions" varchar,
  	"ui_texts_help_title" varchar,
  	"ui_texts_crumb_home" varchar,
  	"ui_texts_crumb_help" varchar,
  	"ui_texts_search_page_title" varchar,
  	"ui_texts_search_suggestions" varchar,
  	"ui_texts_search_no_results" varchar,
  	"ui_texts_search_clear" varchar,
  	"app_name" varchar,
  	"app_android_url" varchar,
  	"app_ios_url" varchar,
  	"app_organization_logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"auth_provider" "enum_users_auth_provider" DEFAULT 'local',
  	"sso_subject" varchar,
  	"sso_session_version" numeric DEFAULT 0,
  	"sso_refresh_token" varchar,
  	"sso_synced_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
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
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"authors_id" integer,
  	"media_id" integer,
  	"products_id" integer,
  	"rates_id" integer,
  	"faqs_id" integer,
  	"help_categories_id" integer,
  	"help_topics_id" integer,
  	"banners_id" integer,
  	"header_id" integer,
  	"footer_id" integer,
  	"tenants_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"search_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_video_mobile_id_media_id_fk" FOREIGN KEY ("video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_background_image_mobile_id_media_id_fk" FOREIGN KEY ("background_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_mobile_id_media_id_fk" FOREIGN KEY ("media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rates_table" ADD CONSTRAINT "pages_blocks_rates_table_rates_id_rates_id_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rates_table" ADD CONSTRAINT "pages_blocks_rates_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content_items" ADD CONSTRAINT "pages_blocks_image_content_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content_items" ADD CONSTRAINT "pages_blocks_image_content_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content" ADD CONSTRAINT "pages_blocks_image_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content" ADD CONSTRAINT "pages_blocks_image_content_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content" ADD CONSTRAINT "pages_blocks_image_content_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_content" ADD CONSTRAINT "pages_blocks_image_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner" ADD CONSTRAINT "pages_blocks_partner_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner" ADD CONSTRAINT "pages_blocks_partner_video_mobile_id_media_id_fk" FOREIGN KEY ("video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_partner" ADD CONSTRAINT "pages_blocks_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_items" ADD CONSTRAINT "pages_blocks_story_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_items" ADD CONSTRAINT "pages_blocks_story_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story" ADD CONSTRAINT "pages_blocks_story_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story" ADD CONSTRAINT "pages_blocks_story_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story" ADD CONSTRAINT "pages_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_items" ADD CONSTRAINT "pages_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contacts_groups_entries" ADD CONSTRAINT "pages_blocks_contacts_groups_entries_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contacts_groups_entries" ADD CONSTRAINT "pages_blocks_contacts_groups_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contacts_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contacts_groups" ADD CONSTRAINT "pages_blocks_contacts_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contacts" ADD CONSTRAINT "pages_blocks_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_groups_items_links" ADD CONSTRAINT "pages_blocks_documents_groups_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents_groups_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_groups_items" ADD CONSTRAINT "pages_blocks_documents_groups_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_groups_items" ADD CONSTRAINT "pages_blocks_documents_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_groups" ADD CONSTRAINT "pages_blocks_documents_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_section" ADD CONSTRAINT "pages_blocks_banner_section_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner_section" ADD CONSTRAINT "pages_blocks_banner_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_logo_id_media_id_fk" FOREIGN KEY ("hero_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_mobile_id_media_id_fk" FOREIGN KEY ("hero_media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_video_mobile_id_media_id_fk" FOREIGN KEY ("hero_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_poster_id_media_id_fk" FOREIGN KEY ("hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_poster_mobile_id_media_id_fk" FOREIGN KEY ("hero_poster_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_video_mobile_id_media_id_fk" FOREIGN KEY ("video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_background_image_mobile_id_media_id_fk" FOREIGN KEY ("background_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_mobile_id_media_id_fk" FOREIGN KEY ("media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_highlight" ADD CONSTRAINT "_pages_v_blocks_product_highlight_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_highlight" ADD CONSTRAINT "_pages_v_blocks_product_highlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rates_table" ADD CONSTRAINT "_pages_v_blocks_rates_table_rates_id_rates_id_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rates_table" ADD CONSTRAINT "_pages_v_blocks_rates_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content_items" ADD CONSTRAINT "_pages_v_blocks_image_content_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content_items" ADD CONSTRAINT "_pages_v_blocks_image_content_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_image_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content" ADD CONSTRAINT "_pages_v_blocks_image_content_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content" ADD CONSTRAINT "_pages_v_blocks_image_content_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content" ADD CONSTRAINT "_pages_v_blocks_image_content_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_content" ADD CONSTRAINT "_pages_v_blocks_image_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner" ADD CONSTRAINT "_pages_v_blocks_partner_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner" ADD CONSTRAINT "_pages_v_blocks_partner_video_mobile_id_media_id_fk" FOREIGN KEY ("video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_partner" ADD CONSTRAINT "_pages_v_blocks_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_items" ADD CONSTRAINT "_pages_v_blocks_story_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_items" ADD CONSTRAINT "_pages_v_blocks_story_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story" ADD CONSTRAINT "_pages_v_blocks_story_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story" ADD CONSTRAINT "_pages_v_blocks_story_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story" ADD CONSTRAINT "_pages_v_blocks_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_items" ADD CONSTRAINT "_pages_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contacts_groups_entries" ADD CONSTRAINT "_pages_v_blocks_contacts_groups_entries_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contacts_groups_entries" ADD CONSTRAINT "_pages_v_blocks_contacts_groups_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contacts_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contacts_groups" ADD CONSTRAINT "_pages_v_blocks_contacts_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contacts" ADD CONSTRAINT "_pages_v_blocks_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_groups_items_links" ADD CONSTRAINT "_pages_v_blocks_documents_groups_items_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents_groups_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_groups_items" ADD CONSTRAINT "_pages_v_blocks_documents_groups_items_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_groups_items" ADD CONSTRAINT "_pages_v_blocks_documents_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_groups" ADD CONSTRAINT "_pages_v_blocks_documents_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner_section" ADD CONSTRAINT "_pages_v_blocks_banner_section_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner_section" ADD CONSTRAINT "_pages_v_blocks_banner_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_logo_id_media_id_fk" FOREIGN KEY ("version_hero_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_mobile_id_media_id_fk" FOREIGN KEY ("version_hero_media_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_video_mobile_id_media_id_fk" FOREIGN KEY ("version_hero_video_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_poster_id_media_id_fk" FOREIGN KEY ("version_hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_poster_mobile_id_media_id_fk" FOREIGN KEY ("version_hero_poster_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_help_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_categories" ADD CONSTRAINT "help_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_topics" ADD CONSTRAINT "help_topics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_topics" ADD CONSTRAINT "help_topics_category_id_help_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_topics_rels" ADD CONSTRAINT "help_topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "help_topics_rels" ADD CONSTRAINT "help_topics_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_topics_v" ADD CONSTRAINT "_help_topics_v_parent_id_help_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."help_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_topics_v" ADD CONSTRAINT "_help_topics_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_topics_v" ADD CONSTRAINT "_help_topics_v_version_category_id_help_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."help_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_help_topics_v_rels" ADD CONSTRAINT "_help_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_help_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_topics_v_rels" ADD CONSTRAINT "_help_topics_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banners_rels" ADD CONSTRAINT "banners_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_mega_groups_links" ADD CONSTRAINT "header_nav_items_mega_groups_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_mega_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_mega_groups" ADD CONSTRAINT "header_nav_items_mega_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_logo_mobile_id_media_id_fk" FOREIGN KEY ("logo_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_highlight_image_id_media_id_fk" FOREIGN KEY ("highlight_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants_ui_texts_popular_searches" ADD CONSTRAINT "tenants_ui_texts_popular_searches_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants_domains" ADD CONSTRAINT "tenants_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_seo_default_image_id_media_id_fk" FOREIGN KEY ("seo_default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_app_organization_logo_id_media_id_fk" FOREIGN KEY ("app_organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rates_fk" FOREIGN KEY ("rates_id") REFERENCES "public"."rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_help_categories_fk" FOREIGN KEY ("help_categories_id") REFERENCES "public"."help_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_help_topics_fk" FOREIGN KEY ("help_topics_id") REFERENCES "public"."help_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_header_fk" FOREIGN KEY ("header_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footer_fk" FOREIGN KEY ("footer_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_items_order_idx" ON "pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_parent_id_idx" ON "pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_items_image_idx" ON "pages_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cards_items_image_mobile_idx" ON "pages_blocks_cards_items" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_video_idx" ON "pages_blocks_cards" USING btree ("video_id");
  CREATE INDEX "pages_blocks_cards_video_mobile_idx" ON "pages_blocks_cards" USING btree ("video_mobile_id");
  CREATE INDEX "pages_blocks_cards_image_idx" ON "pages_blocks_cards" USING btree ("image_id");
  CREATE INDEX "pages_blocks_cards_background_image_idx" ON "pages_blocks_cards" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_cards_background_image_mobile_idx" ON "pages_blocks_cards" USING btree ("background_image_mobile_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_media_block_media_mobile_idx" ON "pages_blocks_media_block" USING btree ("media_mobile_id");
  CREATE INDEX "pages_blocks_product_highlight_order_idx" ON "pages_blocks_product_highlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_highlight_parent_id_idx" ON "pages_blocks_product_highlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_highlight_path_idx" ON "pages_blocks_product_highlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_highlight_product_idx" ON "pages_blocks_product_highlight" USING btree ("product_id");
  CREATE INDEX "pages_blocks_rates_table_order_idx" ON "pages_blocks_rates_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_rates_table_parent_id_idx" ON "pages_blocks_rates_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rates_table_path_idx" ON "pages_blocks_rates_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_rates_table_rates_idx" ON "pages_blocks_rates_table" USING btree ("rates_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_image_idx" ON "pages_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_steps_items_image_mobile_idx" ON "pages_blocks_steps_items" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_content_items_order_idx" ON "pages_blocks_image_content_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_content_items_parent_id_idx" ON "pages_blocks_image_content_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_content_items_icon_idx" ON "pages_blocks_image_content_items" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_image_content_order_idx" ON "pages_blocks_image_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_content_parent_id_idx" ON "pages_blocks_image_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_content_path_idx" ON "pages_blocks_image_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_content_image_idx" ON "pages_blocks_image_content" USING btree ("image_id");
  CREATE INDEX "pages_blocks_image_content_image_mobile_idx" ON "pages_blocks_image_content" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_image_content_logo_idx" ON "pages_blocks_image_content" USING btree ("logo_id");
  CREATE INDEX "pages_blocks_partner_order_idx" ON "pages_blocks_partner" USING btree ("_order");
  CREATE INDEX "pages_blocks_partner_parent_id_idx" ON "pages_blocks_partner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partner_path_idx" ON "pages_blocks_partner" USING btree ("_path");
  CREATE INDEX "pages_blocks_partner_video_idx" ON "pages_blocks_partner" USING btree ("video_id");
  CREATE INDEX "pages_blocks_partner_video_mobile_idx" ON "pages_blocks_partner" USING btree ("video_mobile_id");
  CREATE INDEX "pages_blocks_story_items_order_idx" ON "pages_blocks_story_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_items_parent_id_idx" ON "pages_blocks_story_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_items_icon_idx" ON "pages_blocks_story_items" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_story_order_idx" ON "pages_blocks_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_parent_id_idx" ON "pages_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_path_idx" ON "pages_blocks_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_story_image_idx" ON "pages_blocks_story" USING btree ("image_id");
  CREATE INDEX "pages_blocks_story_image_mobile_idx" ON "pages_blocks_story" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_timeline_items_order_idx" ON "pages_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_items_parent_id_idx" ON "pages_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_items_icon_idx" ON "pages_blocks_timeline_items" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_contacts_groups_entries_order_idx" ON "pages_blocks_contacts_groups_entries" USING btree ("_order");
  CREATE INDEX "pages_blocks_contacts_groups_entries_parent_id_idx" ON "pages_blocks_contacts_groups_entries" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contacts_groups_entries_icon_idx" ON "pages_blocks_contacts_groups_entries" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_contacts_groups_order_idx" ON "pages_blocks_contacts_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_contacts_groups_parent_id_idx" ON "pages_blocks_contacts_groups" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contacts_order_idx" ON "pages_blocks_contacts" USING btree ("_order");
  CREATE INDEX "pages_blocks_contacts_parent_id_idx" ON "pages_blocks_contacts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contacts_path_idx" ON "pages_blocks_contacts" USING btree ("_path");
  CREATE INDEX "pages_blocks_documents_groups_items_links_order_idx" ON "pages_blocks_documents_groups_items_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_groups_items_links_parent_id_idx" ON "pages_blocks_documents_groups_items_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_groups_items_order_idx" ON "pages_blocks_documents_groups_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_groups_items_parent_id_idx" ON "pages_blocks_documents_groups_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_groups_items_icon_idx" ON "pages_blocks_documents_groups_items" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_documents_groups_order_idx" ON "pages_blocks_documents_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_groups_parent_id_idx" ON "pages_blocks_documents_groups" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_section_order_idx" ON "pages_blocks_banner_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_section_parent_id_idx" ON "pages_blocks_banner_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_section_path_idx" ON "pages_blocks_banner_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_section_banner_idx" ON "pages_blocks_banner_section" USING btree ("banner_id");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_hero_hero_logo_idx" ON "pages" USING btree ("hero_logo_id");
  CREATE INDEX "pages_hero_hero_media_mobile_idx" ON "pages" USING btree ("hero_media_mobile_id");
  CREATE INDEX "pages_hero_hero_video_idx" ON "pages" USING btree ("hero_video_id");
  CREATE INDEX "pages_hero_hero_video_mobile_idx" ON "pages" USING btree ("hero_video_mobile_id");
  CREATE INDEX "pages_hero_hero_poster_idx" ON "pages" USING btree ("hero_poster_id");
  CREATE INDEX "pages_hero_hero_poster_mobile_idx" ON "pages" USING btree ("hero_poster_mobile_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_idx" ON "pages" USING btree ("tenant_id","slug");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_items_order_idx" ON "_pages_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_items_parent_id_idx" ON "_pages_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_items_image_idx" ON "_pages_v_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_cards_items_image_mobile_idx" ON "_pages_v_blocks_cards_items" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_video_idx" ON "_pages_v_blocks_cards" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_cards_video_mobile_idx" ON "_pages_v_blocks_cards" USING btree ("video_mobile_id");
  CREATE INDEX "_pages_v_blocks_cards_image_idx" ON "_pages_v_blocks_cards" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_cards_background_image_idx" ON "_pages_v_blocks_cards" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_cards_background_image_mobile_idx" ON "_pages_v_blocks_cards" USING btree ("background_image_mobile_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_media_block_media_mobile_idx" ON "_pages_v_blocks_media_block" USING btree ("media_mobile_id");
  CREATE INDEX "_pages_v_blocks_product_highlight_order_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_highlight_parent_id_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_highlight_path_idx" ON "_pages_v_blocks_product_highlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_highlight_product_idx" ON "_pages_v_blocks_product_highlight" USING btree ("product_id");
  CREATE INDEX "_pages_v_blocks_rates_table_order_idx" ON "_pages_v_blocks_rates_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rates_table_parent_id_idx" ON "_pages_v_blocks_rates_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rates_table_path_idx" ON "_pages_v_blocks_rates_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rates_table_rates_idx" ON "_pages_v_blocks_rates_table" USING btree ("rates_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_image_idx" ON "_pages_v_blocks_steps_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_steps_items_image_mobile_idx" ON "_pages_v_blocks_steps_items" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_content_items_order_idx" ON "_pages_v_blocks_image_content_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_content_items_parent_id_idx" ON "_pages_v_blocks_image_content_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_content_items_icon_idx" ON "_pages_v_blocks_image_content_items" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_image_content_order_idx" ON "_pages_v_blocks_image_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_content_parent_id_idx" ON "_pages_v_blocks_image_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_content_path_idx" ON "_pages_v_blocks_image_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_content_image_idx" ON "_pages_v_blocks_image_content" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_image_content_image_mobile_idx" ON "_pages_v_blocks_image_content" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_image_content_logo_idx" ON "_pages_v_blocks_image_content" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_partner_order_idx" ON "_pages_v_blocks_partner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_partner_parent_id_idx" ON "_pages_v_blocks_partner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_partner_path_idx" ON "_pages_v_blocks_partner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_partner_video_idx" ON "_pages_v_blocks_partner" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_partner_video_mobile_idx" ON "_pages_v_blocks_partner" USING btree ("video_mobile_id");
  CREATE INDEX "_pages_v_blocks_story_items_order_idx" ON "_pages_v_blocks_story_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_items_parent_id_idx" ON "_pages_v_blocks_story_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_items_icon_idx" ON "_pages_v_blocks_story_items" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_story_order_idx" ON "_pages_v_blocks_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_parent_id_idx" ON "_pages_v_blocks_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_path_idx" ON "_pages_v_blocks_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_story_image_idx" ON "_pages_v_blocks_story" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_story_image_mobile_idx" ON "_pages_v_blocks_story" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_order_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_items_parent_id_idx" ON "_pages_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_items_icon_idx" ON "_pages_v_blocks_timeline_items" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contacts_groups_entries_order_idx" ON "_pages_v_blocks_contacts_groups_entries" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contacts_groups_entries_parent_id_idx" ON "_pages_v_blocks_contacts_groups_entries" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contacts_groups_entries_icon_idx" ON "_pages_v_blocks_contacts_groups_entries" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_contacts_groups_order_idx" ON "_pages_v_blocks_contacts_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contacts_groups_parent_id_idx" ON "_pages_v_blocks_contacts_groups" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contacts_order_idx" ON "_pages_v_blocks_contacts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contacts_parent_id_idx" ON "_pages_v_blocks_contacts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contacts_path_idx" ON "_pages_v_blocks_contacts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_documents_groups_items_links_order_idx" ON "_pages_v_blocks_documents_groups_items_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_groups_items_links_parent_id_idx" ON "_pages_v_blocks_documents_groups_items_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_groups_items_order_idx" ON "_pages_v_blocks_documents_groups_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_groups_items_parent_id_idx" ON "_pages_v_blocks_documents_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_groups_items_icon_idx" ON "_pages_v_blocks_documents_groups_items" USING btree ("icon_id");
  CREATE INDEX "_pages_v_blocks_documents_groups_order_idx" ON "_pages_v_blocks_documents_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_groups_parent_id_idx" ON "_pages_v_blocks_documents_groups" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_order_idx" ON "_pages_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_parent_id_idx" ON "_pages_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_path_idx" ON "_pages_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_section_order_idx" ON "_pages_v_blocks_banner_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_section_parent_id_idx" ON "_pages_v_blocks_banner_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_section_path_idx" ON "_pages_v_blocks_banner_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_section_banner_idx" ON "_pages_v_blocks_banner_section" USING btree ("banner_id");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_logo_idx" ON "_pages_v" USING btree ("version_hero_logo_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_mobile_idx" ON "_pages_v" USING btree ("version_hero_media_mobile_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_video_idx" ON "_pages_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_video_mobile_idx" ON "_pages_v" USING btree ("version_hero_video_mobile_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_poster_idx" ON "_pages_v" USING btree ("version_hero_poster_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_poster_mobile_idx" ON "_pages_v" USING btree ("version_hero_poster_mobile_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "version_tenant_version_slug_idx" ON "_pages_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "posts_tenant_idx" ON "posts" USING btree ("tenant_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_wp_id_idx" ON "posts" USING btree ("wp_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_1_idx" ON "posts" USING btree ("tenant_id","slug");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_authors_id_idx" ON "posts_rels" USING btree ("authors_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_tenant_idx" ON "_posts_v" USING btree ("version_tenant_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_wp_id_idx" ON "_posts_v" USING btree ("version_wp_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "version_tenant_version_slug_1_idx" ON "_posts_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_authors_id_idx" ON "_posts_v_rels" USING btree ("authors_id");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "categories_tenant_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_wp_id_idx" ON "categories" USING btree ("wp_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_2_idx" ON "categories" USING btree ("tenant_id","slug");
  CREATE INDEX "authors_tenant_idx" ON "authors" USING btree ("tenant_id");
  CREATE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");
  CREATE INDEX "authors_wp_id_idx" ON "authors" USING btree ("wp_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_3_idx" ON "authors" USING btree ("tenant_id","slug");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "media_wp_id_idx" ON "media" USING btree ("wp_id");
  CREATE INDEX "media_wp_source_url_idx" ON "media" USING btree ("wp_source_url");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
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
  CREATE INDEX "faqs_tenant_idx" ON "faqs" USING btree ("tenant_id");
  CREATE INDEX "faqs_slug_idx" ON "faqs" USING btree ("slug");
  CREATE INDEX "faqs_category_idx" ON "faqs" USING btree ("category_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "help_categories_tenant_idx" ON "help_categories" USING btree ("tenant_id");
  CREATE INDEX "help_categories_slug_idx" ON "help_categories" USING btree ("slug");
  CREATE INDEX "help_categories_icon_idx" ON "help_categories" USING btree ("icon_id");
  CREATE INDEX "help_categories_updated_at_idx" ON "help_categories" USING btree ("updated_at");
  CREATE INDEX "help_categories_created_at_idx" ON "help_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_5_idx" ON "help_categories" USING btree ("tenant_id","slug");
  CREATE INDEX "help_topics_tenant_idx" ON "help_topics" USING btree ("tenant_id");
  CREATE INDEX "help_topics_slug_idx" ON "help_topics" USING btree ("slug");
  CREATE INDEX "help_topics_category_idx" ON "help_topics" USING btree ("category_id");
  CREATE INDEX "help_topics_updated_at_idx" ON "help_topics" USING btree ("updated_at");
  CREATE INDEX "help_topics_created_at_idx" ON "help_topics" USING btree ("created_at");
  CREATE INDEX "help_topics__status_idx" ON "help_topics" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_6_idx" ON "help_topics" USING btree ("tenant_id","slug");
  CREATE INDEX "help_topics_rels_order_idx" ON "help_topics_rels" USING btree ("order");
  CREATE INDEX "help_topics_rels_parent_idx" ON "help_topics_rels" USING btree ("parent_id");
  CREATE INDEX "help_topics_rels_path_idx" ON "help_topics_rels" USING btree ("path");
  CREATE INDEX "help_topics_rels_faqs_id_idx" ON "help_topics_rels" USING btree ("faqs_id");
  CREATE INDEX "_help_topics_v_parent_idx" ON "_help_topics_v" USING btree ("parent_id");
  CREATE INDEX "_help_topics_v_version_version_tenant_idx" ON "_help_topics_v" USING btree ("version_tenant_id");
  CREATE INDEX "_help_topics_v_version_version_slug_idx" ON "_help_topics_v" USING btree ("version_slug");
  CREATE INDEX "_help_topics_v_version_version_category_idx" ON "_help_topics_v" USING btree ("version_category_id");
  CREATE INDEX "_help_topics_v_version_version_updated_at_idx" ON "_help_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_help_topics_v_version_version_created_at_idx" ON "_help_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_help_topics_v_version_version__status_idx" ON "_help_topics_v" USING btree ("version__status");
  CREATE INDEX "_help_topics_v_created_at_idx" ON "_help_topics_v" USING btree ("created_at");
  CREATE INDEX "_help_topics_v_updated_at_idx" ON "_help_topics_v" USING btree ("updated_at");
  CREATE INDEX "_help_topics_v_latest_idx" ON "_help_topics_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_2_idx" ON "_help_topics_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_help_topics_v_rels_order_idx" ON "_help_topics_v_rels" USING btree ("order");
  CREATE INDEX "_help_topics_v_rels_parent_idx" ON "_help_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_help_topics_v_rels_path_idx" ON "_help_topics_v_rels" USING btree ("path");
  CREATE INDEX "_help_topics_v_rels_faqs_id_idx" ON "_help_topics_v_rels" USING btree ("faqs_id");
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
  CREATE INDEX "header_nav_items_mega_groups_links_order_idx" ON "header_nav_items_mega_groups_links" USING btree ("_order");
  CREATE INDEX "header_nav_items_mega_groups_links_parent_id_idx" ON "header_nav_items_mega_groups_links" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_mega_groups_order_idx" ON "header_nav_items_mega_groups" USING btree ("_order");
  CREATE INDEX "header_nav_items_mega_groups_parent_id_idx" ON "header_nav_items_mega_groups" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_tenant_idx" ON "header" USING btree ("tenant_id");
  CREATE INDEX "header_logo_idx" ON "header" USING btree ("logo_id");
  CREATE INDEX "header_updated_at_idx" ON "header" USING btree ("updated_at");
  CREATE INDEX "header_created_at_idx" ON "header" USING btree ("created_at");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_image_idx" ON "footer_columns_links" USING btree ("image_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_tenant_idx" ON "footer" USING btree ("tenant_id");
  CREATE INDEX "footer_logo_idx" ON "footer" USING btree ("logo_id");
  CREATE INDEX "footer_logo_mobile_idx" ON "footer" USING btree ("logo_mobile_id");
  CREATE INDEX "footer_highlight_image_idx" ON "footer" USING btree ("highlight_image_id");
  CREATE INDEX "footer_updated_at_idx" ON "footer" USING btree ("updated_at");
  CREATE INDEX "footer_created_at_idx" ON "footer" USING btree ("created_at");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "tenants_ui_texts_popular_searches_order_idx" ON "tenants_ui_texts_popular_searches" USING btree ("_order");
  CREATE INDEX "tenants_ui_texts_popular_searches_parent_id_idx" ON "tenants_ui_texts_popular_searches" USING btree ("_parent_id");
  CREATE INDEX "tenants_domains_order_idx" ON "tenants_domains" USING btree ("_order");
  CREATE INDEX "tenants_domains_parent_id_idx" ON "tenants_domains" USING btree ("_parent_id");
  CREATE INDEX "tenants_domains_domain_idx" ON "tenants_domains" USING btree ("domain");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_seo_default_image_idx" ON "tenants" USING btree ("seo_default_image_id");
  CREATE INDEX "tenants_app_app_organization_logo_idx" ON "tenants" USING btree ("app_organization_logo_id");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_sso_subject_idx" ON "users" USING btree ("sso_subject");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
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
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_tenant_idx" ON "search" USING btree ("tenant_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("rates_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_help_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("help_categories_id");
  CREATE INDEX "payload_locked_documents_rels_help_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("help_topics_id");
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");
  CREATE INDEX "payload_locked_documents_rels_header_id_idx" ON "payload_locked_documents_rels" USING btree ("header_id");
  CREATE INDEX "payload_locked_documents_rels_footer_id_idx" ON "payload_locked_documents_rels" USING btree ("footer_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_cards_items" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_product_highlight" CASCADE;
  DROP TABLE "pages_blocks_rates_table" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_image_content_items" CASCADE;
  DROP TABLE "pages_blocks_image_content" CASCADE;
  DROP TABLE "pages_blocks_partner" CASCADE;
  DROP TABLE "pages_blocks_story_items" CASCADE;
  DROP TABLE "pages_blocks_story" CASCADE;
  DROP TABLE "pages_blocks_timeline_items" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_contacts_groups_entries" CASCADE;
  DROP TABLE "pages_blocks_contacts_groups" CASCADE;
  DROP TABLE "pages_blocks_contacts" CASCADE;
  DROP TABLE "pages_blocks_documents_groups_items_links" CASCADE;
  DROP TABLE "pages_blocks_documents_groups_items" CASCADE;
  DROP TABLE "pages_blocks_documents_groups" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_banner_section" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_product_highlight" CASCADE;
  DROP TABLE "_pages_v_blocks_rates_table" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_image_content_items" CASCADE;
  DROP TABLE "_pages_v_blocks_image_content" CASCADE;
  DROP TABLE "_pages_v_blocks_partner" CASCADE;
  DROP TABLE "_pages_v_blocks_story_items" CASCADE;
  DROP TABLE "_pages_v_blocks_story" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_contacts_groups_entries" CASCADE;
  DROP TABLE "_pages_v_blocks_contacts_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_contacts" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_groups_items_links" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_groups_items" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_banner_section" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "products_benefits" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "rates_items" CASCADE;
  DROP TABLE "rates" CASCADE;
  DROP TABLE "_rates_v_version_items" CASCADE;
  DROP TABLE "_rates_v" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "help_categories" CASCADE;
  DROP TABLE "help_topics" CASCADE;
  DROP TABLE "help_topics_rels" CASCADE;
  DROP TABLE "_help_topics_v" CASCADE;
  DROP TABLE "_help_topics_v_rels" CASCADE;
  DROP TABLE "banners" CASCADE;
  DROP TABLE "banners_rels" CASCADE;
  DROP TABLE "header_nav_items_mega_groups_links" CASCADE;
  DROP TABLE "header_nav_items_mega_groups" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "tenants_ui_texts_popular_searches" CASCADE;
  DROP TABLE "tenants_domains" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_theme";
  DROP TYPE "public"."enum_pages_blocks_cards_items_icon";
  DROP TYPE "public"."enum_pages_blocks_cards_items_background";
  DROP TYPE "public"."enum_pages_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_cards_variant";
  DROP TYPE "public"."enum_pages_blocks_cards_theme";
  DROP TYPE "public"."enum_pages_blocks_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_cards_section_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_theme";
  DROP TYPE "public"."enum_pages_blocks_media_block_background";
  DROP TYPE "public"."enum_pages_blocks_product_highlight_image_position";
  DROP TYPE "public"."enum_pages_blocks_faq_theme";
  DROP TYPE "public"."enum_pages_blocks_faq_variant";
  DROP TYPE "public"."enum_pages_blocks_faq_more_link_type";
  DROP TYPE "public"."enum_pages_blocks_steps_theme";
  DROP TYPE "public"."enum_pages_blocks_steps_link_type";
  DROP TYPE "public"."enum_pages_blocks_image_content_variant";
  DROP TYPE "public"."enum_pages_blocks_image_content_theme";
  DROP TYPE "public"."enum_pages_blocks_image_content_link_type";
  DROP TYPE "public"."enum_pages_blocks_partner_link_type";
  DROP TYPE "public"."enum_pages_blocks_contacts_groups_entries_link_type";
  DROP TYPE "public"."enum_pages_blocks_contacts_link_type";
  DROP TYPE "public"."enum_pages_blocks_documents_groups_items_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_testimonials_theme";
  DROP TYPE "public"."enum_pages_blocks_archive_theme";
  DROP TYPE "public"."enum_pages_blocks_archive_variant";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_blocks_archive_more_link_type";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_hero_tone";
  DROP TYPE "public"."enum_pages_hero_size";
  DROP TYPE "public"."enum_pages_hero_disclaimer_link_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_theme";
  DROP TYPE "public"."enum__pages_v_blocks_cards_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_cards_items_background";
  DROP TYPE "public"."enum__pages_v_blocks_cards_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cards_variant";
  DROP TYPE "public"."enum__pages_v_blocks_cards_theme";
  DROP TYPE "public"."enum__pages_v_blocks_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_cards_section_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_theme";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_background";
  DROP TYPE "public"."enum__pages_v_blocks_product_highlight_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_faq_theme";
  DROP TYPE "public"."enum__pages_v_blocks_faq_variant";
  DROP TYPE "public"."enum__pages_v_blocks_faq_more_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_steps_theme";
  DROP TYPE "public"."enum__pages_v_blocks_steps_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_image_content_variant";
  DROP TYPE "public"."enum__pages_v_blocks_image_content_theme";
  DROP TYPE "public"."enum__pages_v_blocks_image_content_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_partner_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_contacts_groups_entries_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_contacts_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_documents_groups_items_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_theme";
  DROP TYPE "public"."enum__pages_v_blocks_archive_theme";
  DROP TYPE "public"."enum__pages_v_blocks_archive_variant";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_blocks_archive_more_link_type";
  DROP TYPE "public"."enum__pages_v_version_template";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_tone";
  DROP TYPE "public"."enum__pages_v_version_hero_size";
  DROP TYPE "public"."enum__pages_v_version_hero_disclaimer_link_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
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
  DROP TYPE "public"."enum_help_topics_status";
  DROP TYPE "public"."enum__help_topics_v_version_status";
  DROP TYPE "public"."enum_banners_link_type";
  DROP TYPE "public"."enum_header_nav_items_mega_groups_links_link_type";
  DROP TYPE "public"."enum_header_nav_items_kind";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_header_cta_type";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_tenants_theme_preset";
  DROP TYPE "public"."enum_tenants_layout";
  DROP TYPE "public"."enum_tenants_blog_url_style";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_tenants_roles";
  DROP TYPE "public"."enum_users_auth_provider";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_redirects_wave";
  DROP TYPE "public"."enum_redirects_origin";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
