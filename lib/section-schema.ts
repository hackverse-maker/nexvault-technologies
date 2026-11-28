// Shared schema for dynamic page sections.
// Used by the admin section builder (form generation) and documents the
// content JSONB shape rendered by components/site/section-renderer.tsx.

export type SectionTypeDef = {
  type: string
  label: string
  description: string
  defaults: Record<string, unknown>
  /** fields rendered in the editor; 'items' renders a repeatable row editor */
  fields: FieldDef[]
}

export type FieldKind = 'text' | 'textarea' | 'image' | 'select' | 'items' | 'lines'

export type FieldDef = {
  key: string
  label: string
  kind: FieldKind
  options?: { value: string; label: string }[]
  itemFields?: { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'lines'; placeholder?: string }[]
  help?: string
}

export const BACKGROUND_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark panel' },
  { value: 'glass', label: 'Glass' },
  { value: 'gradient', label: 'Blue gradient' },
]

export const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'center', label: 'Centered' },
  { value: 'split', label: 'Split (text + image)' },
]

const commonFields: FieldDef[] = [
  { key: 'eyebrow', label: 'Eyebrow', kind: 'text', help: 'Small uppercase label above the heading' },
  { key: 'title', label: 'Heading', kind: 'text' },
  { key: 'text', label: 'Description', kind: 'textarea' },
  { key: 'image', label: 'Image URL', kind: 'image', help: 'Optional — used by layouts that support imagery' },
  { key: 'bgImage', label: 'Hero background image', kind: 'image', help: 'Optional — full-bleed photo behind hero text (hero sections only)' },
  { key: 'ctaLabel', label: 'Button label', kind: 'text' },
  { key: 'ctaHref', label: 'Button URL', kind: 'text', help: 'e.g. /contact or https://…' },
  { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
  { key: 'layout', label: 'Layout', kind: 'select', options: LAYOUT_OPTIONS },
]

type ItemField = NonNullable<FieldDef['itemFields']>[number]
const item = (key: string, label: string, kind: ItemField['kind'], placeholder?: string): ItemField =>
  ({ key, label, kind, placeholder })

export const SECTION_TYPES: SectionTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Large opening banner with heading, copy, image, and CTA.',
    defaults: { eyebrow: 'Welcome', title: 'Your headline here', text: 'A short introduction to this page.', ctaLabel: 'Get started', ctaHref: '/contact', background: 'default', layout: 'split' },
    fields: [
      ...commonFields,
      { key: 'align', label: 'Text alignment', kind: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], help: 'Overrides the layout alignment' },
      { key: 'height', label: 'Hero height', kind: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'tall', label: 'Tall' }, { value: 'compact', label: 'Compact' }] },
      { key: 'overlay', label: 'Overlay darkness', kind: 'select', options: [{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'dark', label: 'Dark' }], help: 'How dark the layer over the background image is' },
      { key: 'position', label: 'Image focal point', kind: 'select', options: [{ value: 'center', label: 'Center' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }] },
      { key: 'cta2Label', label: 'Secondary button label (optional)', kind: 'text' },
      { key: 'cta2Href', label: 'Secondary button URL', kind: 'text' },
    ],
  },
  {
    type: 'about',
    label: 'About',
    description: 'Story section with image and key points.',
    defaults: { eyebrow: 'About us', title: 'Our story', text: 'Tell visitors who you are and what you stand for.', image: '', background: 'default', layout: 'split', items: [{ title: 'Point one', text: 'Short supporting detail.' }] },
    fields: [
      ...commonFields,
      { key: 'items', label: 'Key points', kind: 'items', itemFields: [item('title', 'Point', 'text'), item('text', 'Detail', 'textarea')] },
    ],
  },
  {
    type: 'services',
    label: 'Services',
    description: 'Grid of service cards — manual items or live services catalog.',
    defaults: { eyebrow: 'What we do', title: 'Our services', text: '', background: 'default', layout: 'default', source: 'manual', category: '', items: [{ title: 'Service name', description: 'What it includes.' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'source', label: 'Content source', kind: 'select', options: [{ value: 'manual', label: 'Manual items' }, { value: 'database', label: 'Services catalog (live)' }], help: 'Database pulls active services — filter by category below' },
      { key: 'category', label: 'Category filter', kind: 'text', help: 'Only used with live source — e.g. Web, Visibility, Growth' },
      { key: 'items', label: 'Services', kind: 'items', itemFields: [item('title', 'Title', 'text'), item('description', 'Description', 'textarea'), item('href', 'Link URL (optional)', 'text'), { key: 'features', label: 'Feature bullets (one per line, optional)', kind: 'lines' }] },
    ],
  },
  {
    type: 'features',
    label: 'Features',
    description: 'Grid of feature highlights.',
    defaults: { eyebrow: 'Why us', title: 'Built for results', text: '', background: 'default', layout: 'default', items: [{ title: 'Feature', description: 'What makes it valuable.' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Features', kind: 'items', itemFields: [item('title', 'Title', 'text'), item('description', 'Description', 'textarea')] },
    ],
  },
  {
    type: 'portfolio',
    label: 'Portfolio',
    description: 'Project / work showcase grid.',
    defaults: { eyebrow: 'Selected work', title: 'Our work', text: '', background: 'dark', layout: 'default', items: [{ title: 'Project name', category: 'Web', description: 'Short project summary.', image: '' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Projects', kind: 'items', itemFields: [item('title', 'Title', 'text'), item('slug', 'Slug (optional — detail page URL)', 'text'), item('category', 'Category', 'text'), item('description', 'Description', 'textarea'), item('image', 'Image URL', 'image'), { key: 'tech', label: 'Technologies (one per line, optional)', kind: 'lines' }, item('link', 'Live site URL (optional — only real links)', 'text'), item('demo', 'Demo project? (yes/no, optional)', 'text')] },
    ],
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Customer quotes and social proof.',
    defaults: { eyebrow: 'Kind words', title: 'What clients say', text: '', background: 'default', layout: 'default', items: [{ quote: 'A genuine client quote goes here.', author: 'Client name' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Testimonials', kind: 'items', itemFields: [item('quote', 'Quote', 'textarea'), item('author', 'Author', 'text')] },
    ],
  },
  {
    type: 'stats',
    label: 'Statistics',
    description: 'Numbers and metrics row.',
    defaults: { eyebrow: '', title: 'By the numbers', text: '', background: 'default', layout: 'default', items: [{ value: '100+', label: 'Projects delivered' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Stats', kind: 'items', itemFields: [item('value', 'Value', 'text', 'e.g. 120+'), item('label', 'Label', 'text')] },
    ],
  },
  {
    type: 'team',
    label: 'Team',
    description: 'Team member cards.',
    defaults: { eyebrow: 'The team', title: 'Meet the team', text: '', background: 'default', layout: 'default', items: [{ name: 'Name', role: 'Role', bio: 'Short bio.', image: '' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Members', kind: 'items', itemFields: [item('name', 'Name', 'text'), item('role', 'Role', 'text'), item('bio', 'Bio', 'textarea'), item('image', 'Photo URL', 'image')] },
    ],
  },
  {
    type: 'pricing',
    label: 'Pricing',
    description: 'Pricing plan cards — manual items or live products catalog.',
    defaults: { eyebrow: 'Pricing', title: 'Plans & pricing', text: '', background: 'default', layout: 'default', source: 'manual', category: '', items: [{ name: 'Basic', label: 'For starters', price: 'Rs. 10,000', features: 'Feature one\nFeature two' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'source', label: 'Content source', kind: 'select', options: [{ value: 'manual', label: 'Manual items' }, { value: 'database', label: 'Products catalog (live)' }], help: 'Database pulls active products — filter by category below' },
      { key: 'category', label: 'Category filter', kind: 'text', help: 'Only used with live source — e.g. website-package, maintenance' },
      { key: 'items', label: 'Plans', kind: 'items', itemFields: [item('name', 'Name', 'text'), item('label', 'Subtitle', 'text'), item('price', 'Price', 'text'), { key: 'features', label: 'Features (one per line)', kind: 'lines' }] },
    ],
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion.',
    defaults: { eyebrow: 'FAQ', title: 'Common questions', text: '', background: 'default', layout: 'default', items: [{ q: 'Question?', a: 'Answer.' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Questions', kind: 'items', itemFields: [item('q', 'Question', 'text'), item('a', 'Answer', 'textarea')] },
    ],
  },
  {
    type: 'process',
    label: 'Process workflow',
    description: 'Connected step-by-step workflow diagram (Discover → Grow).',
    defaults: {
      eyebrow: 'Process',
      title: 'A clear path from idea to impact.',
      text: 'Every engagement follows a visible process so you always know what’s happening and what’s next.',
      background: 'default',
      items: [
        { title: 'Discover', text: 'We understand your business, goals, audience, and project requirements.' },
        { title: 'Plan', text: 'We define the strategy, project scope, structure, and timeline.' },
        { title: 'Design', text: 'We create the visual direction, layouts, and user experience.' },
        { title: 'Development', text: 'We turn approved designs into a responsive, functional website.' },
        { title: 'Launch', text: 'We test, optimize, and launch your website smoothly.' },
        { title: 'Grow', text: 'We support your growth through ongoing improvements and optimization.' },
      ],
    },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Steps (exactly 6, in order)', kind: 'items', itemFields: [item('title', 'Step name', 'text'), item('text', 'Step description', 'textarea')] },
    ],
  },
  {
    type: 'logo_showcase',
    label: 'Logo showcase',
    description: 'Row of client / partner logos.',
    defaults: { eyebrow: 'Trusted by', title: 'Our clients & partners', text: '', background: 'default', layout: 'default', items: [{ name: 'Client name', image: '' }] },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'items', label: 'Logos', kind: 'items', itemFields: [item('name', 'Name', 'text'), item('image', 'Logo image', 'image'), item('url', 'Website URL (optional)', 'text')] },
    ],
  },
  {
    type: 'slider',
    label: 'Image slider',
    description: 'Carousel managed in Media Library → Sliders.',
    defaults: { eyebrow: '', title: '', text: '', sliderSlug: '', autoplay: 'yes', background: 'default', layout: 'default' },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'sliderSlug', label: 'Slider slug', kind: 'text', help: 'Slug shown under Media Library → Sliders tab' },
      { key: 'autoplay', label: 'Auto-advance', kind: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
    ],
  },
  {
    type: 'blog_grid',
    label: 'Blog grid',
    description: 'Grid of published journal posts.',
    defaults: { eyebrow: 'Journal', title: 'Notes on digital growth', text: '', background: 'default', layout: 'default' },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
    ],
  },
  {
    type: 'contact',
    label: 'Contact',
    description: 'Contact details plus inquiry form.',
    defaults: { eyebrow: 'Contact', title: "Let's talk", text: 'Send us a message and we will reply shortly.', defaultPackage: '', background: 'default', layout: 'default' },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'defaultPackage', label: 'Preselected package', kind: 'text', help: 'Optional — pre-fills the package dropdown in the form' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
    ],
  },
  {
    type: 'cta',
    label: 'CTA',
    description: 'Call-to-action banner.',
    defaults: { eyebrow: 'Get started', title: 'Ready to grow?', text: 'Tell us about your project.', ctaLabel: 'Get a quote', ctaHref: '/get-a-quote', background: 'gradient', layout: 'center' },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Description', kind: 'textarea' },
      { key: 'ctaLabel', label: 'Button label', kind: 'text' },
      { key: 'ctaHref', label: 'Button URL', kind: 'text' },
      { key: 'whatsappMessage', label: 'WhatsApp message (optional)', kind: 'text', help: 'Set to show an extra WhatsApp button with this message' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'layout', label: 'Layout', kind: 'select', options: LAYOUT_OPTIONS },
    ],
  },
  {
    type: 'text',
    label: 'Custom content',
    description: 'Free-form rich text block.',
    defaults: { eyebrow: '', title: 'Section title', text: '', paragraphs: ['Write your content here.'], image: '', background: 'default', layout: 'default' },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
      { key: 'title', label: 'Heading', kind: 'text' },
      { key: 'text', label: 'Intro', kind: 'textarea' },
      { key: 'paragraphs', label: 'Paragraphs (one per line)', kind: 'lines' },
      { key: 'image', label: 'Image URL', kind: 'image' },
      { key: 'background', label: 'Background', kind: 'select', options: BACKGROUND_OPTIONS },
      { key: 'layout', label: 'Layout', kind: 'select', options: LAYOUT_OPTIONS },
    ],
  },
]

// Legacy section types already stored in the DB keep working.
export const LEGACY_TYPE_ALIASES: Record<string, string> = {
  services_grid: 'services',
  features_grid: 'features',
  work_grid: 'portfolio',
  gallery: 'portfolio',
  statistics: 'stats',
  custom: 'text',
}

export function getSectionTypeDef(type: string): SectionTypeDef {
  const resolved = LEGACY_TYPE_ALIASES[type] ?? type
  return SECTION_TYPES.find((t) => t.type === resolved) ?? SECTION_TYPES[SECTION_TYPES.length - 1]
}

export function defaultContentFor(type: string): Record<string, unknown> {
  return JSON.parse(JSON.stringify(getSectionTypeDef(type).defaults))
}
