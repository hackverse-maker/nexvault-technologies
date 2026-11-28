import {
  type AnyPgColumn,
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
  caption: text('caption').notNull().default(''),
  folder: text('folder').notNull().default('general'),
  tags: jsonb('tags').notNull().default([]),
  uploadedBy: uuid('uploaded_by').references(() => adminUsers.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('media_library_size_check', sql`${table.byteSize} > 0`),
  check('media_library_dimensions_check', sql`(${table.width} is null or ${table.width} > 0) and (${table.height} is null or ${table.height} > 0)`),
  index('media_library_folder_idx').on(table.folder),
])

export const mediaAssignments = pgTable('media_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  mediaId: uuid('media_id').notNull().references(() => mediaLibrary.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id'),
  role: text('role').notNull().default('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
}, (table) => [
  check('media_assignments_target_type_check', sql`${table.targetType} in ('page', 'section', 'product', 'service', 'header', 'footer', 'website')`),
  index('media_assignments_media_idx').on(table.mediaId),
  index('media_assignments_target_idx').on(table.targetType, table.targetId),
])

export const heroSlides = pgTable('hero_slides', {
  id: uuid('id').defaultRandom().primaryKey(),
  mediaId: uuid('media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  title: text('title').notNull().default(''),
  subtitle: text('subtitle').notNull().default(''),
  ctaLabel: text('cta_label').notNull().default(''),
  ctaHref: text('cta_href').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('hero_slides_sort_idx').on(table.sortOrder)])

export const sliders = pgTable('sliders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  pageId: uuid('page_id').references(() => pages.id, { onDelete: 'cascade' }),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('sliders_page_idx').on(table.pageId)])

export const sliderSlides = pgTable('slider_slides', {
  id: uuid('id').defaultRandom().primaryKey(),
  sliderId: uuid('slider_id').notNull().references(() => sliders.id, { onDelete: 'cascade' }),
  mediaId: uuid('media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  title: text('title').notNull().default(''),
  caption: text('caption').notNull().default(''),
  ctaLabel: text('cta_label').notNull().default(''),
  ctaHref: text('cta_href').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
}, (table) => [index('slider_slides_slider_idx').on(table.sliderId, table.sortOrder)])

export const designSettings = pgTable('design_settings', {
  id: smallint('id').primaryKey().default(1),
  values: jsonb('values').notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('design_settings_singleton_check', sql`${table.id} = 1`)])

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  category: text('category').notNull().default('Journal'),
  image: text('image').notNull().default(''),
  content: jsonb('content').notNull().default([]),
  tags: jsonb('tags').notNull().default([]),
  readTime: text('read_time').notNull().default(''),
  status: text('status').notNull().default('draft'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('blog_posts_status_check', sql`${table.status} in ('draft', 'published')`),
  index('blog_posts_status_idx').on(table.status, table.publishedAt),
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
  ogImage: text('og_image'),
  publishedSnapshot: jsonb('published_snapshot'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  draftSavedAt: timestamp('draft_saved_at', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('pages_status_check', sql`${table.status} in ('draft', 'published', 'archived')`),
  index('pages_status_idx').on(table.status),
])

export const pageVersions = pgTable('page_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  note: text('note'),
  createdBy: text('created_by'),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex('page_versions_page_version_uidx').on(table.pageId, table.versionNumber),
  index('page_versions_page_id_idx').on(table.pageId),
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
  footerColumnId: uuid('footer_column_id').references(() => footerColumns.id, { onDelete: 'set null' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => navigationItems.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('navigation_items_location_check', sql`${table.location} in ('header', 'footer')`),
  check('navigation_items_target_check', sql`(${table.targetPageId} is not null) <> (${table.targetUrl} is not null)`),
  uniqueIndex('navigation_items_location_sort_uidx').on(table.location, table.sortOrder),
])

export const footerColumns = pgTable('footer_columns', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('footer_columns_sort_idx').on(table.sortOrder)])

export const headerSettings = pgTable('header_settings', {
  id: smallint('id').primaryKey().default(1),
  logoMediaId: uuid('logo_media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  ctaLabel: text('cta_label').notNull().default('Get a free quote'),
  ctaHref: text('cta_href').notNull().default('/get-a-quote'),
  whatsappEnabled: boolean('whatsapp_enabled').notNull().default(true),
  whatsappNumber: text('whatsapp_number'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [check('header_settings_singleton_check', sql`${table.id} = 1`)])

export const footerConfiguration = pgTable('footer_configuration', {
  id: smallint('id').primaryKey().default(1),
  heading: text('heading').notNull().default(''),
  description: text('description').notNull().default(''),
  copyrightText: text('copyright_text').notNull().default(''),
  showSocialLinks: boolean('show_social_links').notNull().default(true),
  logoMediaId: uuid('logo_media_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
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
  comparePrice: numeric('compare_price', { precision: 12, scale: 2 }),
  features: jsonb('features').notNull().default([]),
  category: text('category').notNull().default(''),
  ctaLabel: text('cta_label'),
  whatsappMessage: text('whatsapp_message'),
  showOnHomepage: boolean('show_on_homepage').notNull().default(false),
  isPopular: boolean('is_popular').notNull().default(false),
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
  category: text('category').notNull().default(''),
  icon: text('icon'),
  ctaLabel: text('cta_label'),
  whatsappMessage: text('whatsapp_message'),
  showOnHomepage: boolean('show_on_homepage').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('services_active_sort_idx').on(table.isActive, table.sortOrder)])

export const whatsappSettings = pgTable('whatsapp_settings', {
  id: integer('id').primaryKey().default(1),
  widgetEnabled: boolean('widget_enabled').notNull().default(true),
  defaultMessage: text('default_message').notNull().default('Hello! I visited your website and would like to inquire about your services.'),
  visibility: text('visibility').notNull().default('all'),
  hiddenPages: text('hidden_pages').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const whatsappNumbers = pgTable('whatsapp_numbers', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: text('label').notNull(),
  phone: text('phone').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  businessName: text('business_name'),
  phone: text('phone'),
  subject: text('subject'),
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

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  email: text('email'),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  planName: text('plan_name').notNull(),
  planPrice: numeric('plan_price', { precision: 12, scale: 2 }).notNull(),
  comparePrice: numeric('compare_price', { precision: 12, scale: 2 }),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('PKR'),
  finalAmount: numeric('final_amount', { precision: 12, scale: 2 }).notNull(),
  advanceAmount: numeric('advance_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  balanceAmount: numeric('balance_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull().default('unpaid'),
  orderStatus: text('order_status').notNull().default('pending'),
  adminNotes: text('admin_notes'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  check('orders_payment_method_check', sql`${table.paymentMethod} in ('cash', 'online')`),
  check('orders_payment_status_check', sql`${table.paymentStatus} in ('unpaid', 'pending_verification', 'paid', 'failed', 'refunded')`),
  check('orders_order_status_check', sql`${table.orderStatus} in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')`),
  check('orders_amounts_check', sql`${table.planPrice} >= 0 and ${table.finalAmount} >= 0`),
  index('orders_created_idx').on(table.createdAt),
  index('orders_status_idx').on(table.orderStatus, table.paymentStatus),
])

export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  ip: text('ip').notNull(),
  success: boolean('success').notNull().default(false),
  createdAt: createdAt(),
}, (table) => [
  index('login_attempts_email_ip_created_idx').on(table.email, table.ip, table.createdAt),
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
