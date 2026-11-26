import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_user_id_idx').on(table.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('account_user_id_idx').on(table.userId)])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)])

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('editor'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('admin_users_role_check', sql`${table.role} in ('admin', 'editor')`)])

export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').defaultRandom().primaryKey(),
  storageProvider: text('storage_provider').notNull().default('vercel_blob'),
  objectKey: text('object_key').notNull().unique(),
  publicUrl: text('public_url').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  byteSize: integer('byte_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text').notNull().default(''),
  uploadedBy: uuid('uploaded_by').references(() => adminUsers.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
}, (table) => [
  check('media_library_size_check', sql`${table.byteSize} > 0`),
  check('media_library_dimensions_check', sql`(${table.width} is null or ${table.width} > 0) and (${table.height} is null or ${table.height} > 0)`),
])

export const websiteSettings = pgTable('website_settings', {
  id: smallint('id').primaryKey().default(1),
  companyName: text('company_name').notNull(),
  tagline: text('tagline').notNull().default(''),
  defaultSeoTitle: text('default_seo_title').notNull().default(''),
  defaultSeoDescription: text('default_seo_description').notNull().default(''),
  logoMediaId: uuid('logo_media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('website_settings_singleton_check', sql`${table.id} = 1`)])

export const contactInformation = pgTable('contact_information', {
  id: smallint('id').primaryKey().default(1),
  primaryPhone: text('primary_phone').notNull(),
  secondaryPhone: text('secondary_phone').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  businessEmail: text('business_email').notNull(),
  address: text('address'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('contact_information_singleton_check', sql`${table.id} = 1`)])

export const socialMediaLinks = pgTable('social_media_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  platform: text('platform').notNull().unique(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('social_media_links_sort_order_idx').on(table.sortOrder)])

export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('pages_status_check', sql`${table.status} in ('draft', 'published', 'archived')`),
  index('pages_status_idx').on(table.status),
])

export const sections = pgTable('sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  sectionType: text('section_type').notNull(),
  content: jsonb('content').notNull().default({}),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex('sections_page_sort_order_uidx').on(table.pageId, table.sortOrder),
  index('sections_page_id_idx').on(table.pageId),
])

export const navigationItems = pgTable('navigation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  location: text('location').notNull().default('header'),
  targetPageId: uuid('target_page_id').references(() => pages.id, { onDelete: 'set null' }),
  targetUrl: text('target_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('navigation_items_location_check', sql`${table.location} in ('header', 'footer')`),
  check('navigation_items_target_check', sql`(${table.targetPageId} is not null) <> (${table.targetUrl} is not null)`),
  uniqueIndex('navigation_items_location_sort_uidx').on(table.location, table.sortOrder),
])

export const footerConfiguration = pgTable('footer_configuration', {
  id: smallint('id').primaryKey().default(1),
  heading: text('heading').notNull().default(''),
  description: text('description').notNull().default(''),
  copyrightText: text('copyright_text').notNull().default(''),
  showSocialLinks: boolean('show_social_links').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('footer_configuration_singleton_check', sql`${table.id} = 1`)])

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('PKR'),
  mediaId: uuid('media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('products_price_check', sql`${table.price} >= 0`),
  check('products_status_check', sql`${table.status} in ('draft', 'active', 'archived')`),
  index('products_status_sort_idx').on(table.status, table.sortOrder),
])

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  features: jsonb('features').notNull().default([]),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('services_active_sort_idx').on(table.isActive, table.sortOrder)])

export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  businessName: text('business_name'),
  phone: text('phone'),
  message: text('message').notNull(),
  requestedPackage: text('requested_package'),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('new'),
  adminNotes: text('admin_notes'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('contact_inquiries_status_check', sql`${table.status} in ('new', 'viewed', 'replied', 'archived')`),
  index('contact_inquiries_status_created_idx').on(table.status, table.createdAt),
  index('contact_inquiries_email_idx').on(table.email),
])

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: jsonb('details').notNull().default({}),
  createdAt: createdAt(),
}, (table) => [
  index('activity_logs_admin_created_idx').on(table.adminUserId, table.createdAt),
  index('activity_logs_entity_idx').on(table.entityType, table.entityId),
])
