import type { LucideIcon } from 'lucide-react'
import { Blocks, Brush, Code2, Globe2, LineChart, Megaphone, Palette, Search, Settings2, ShoppingBag, Sparkles, Store, Target, Wrench } from 'lucide-react'

export type Service = { slug: string; title: string; description: string; icon: LucideIcon; features: string[] }
export const services: Service[] = [
  { slug: 'web-development', title: 'Web Design & Development', description: 'High-performance websites engineered to make your first impression count.', icon: Code2, features: ['Responsive, accessible interfaces', 'Modern Next.js engineering', 'Conversion-focused UX', 'Performance and SEO foundations'] },
  { slug: 'ecommerce', title: 'E-commerce Development', description: 'Digital storefronts that make buying simple, memorable, and scalable.', icon: ShoppingBag, features: ['Product and catalog experiences', 'Secure checkout journeys', 'Conversion-ready design', 'Analytics and growth setup'] },
  { slug: 'google-business-profile', title: 'Google Business Profile', description: 'Get discovered locally with a profile that builds trust before the first call.', icon: Store, features: ['Profile setup and guidance', 'Maps listing assistance', 'Business information management', 'Photo and service updates'] },
  { slug: 'local-seo', title: 'Google Maps Optimization', description: 'Make your local presence clearer, stronger, and easier to find.', icon: Globe2, features: ['Local SEO improvements', 'Listing optimization', 'Review response guidance', 'Location-focused content'] },
  { slug: 'seo', title: 'Search Engine Optimization', description: 'A durable search strategy built around relevance, clarity, and momentum.', icon: Search, features: ['Technical SEO audits', 'Content strategy', 'On-page optimization', 'Search performance reporting'] },
  { slug: 'google-ads', title: 'Google Ads Management', description: 'Focused campaigns that turn intent into measurable opportunities.', icon: Target, features: ['Search and display campaigns', 'Audience and keyword targeting', 'Conversion tracking', 'Performance reporting'] },
  { slug: 'social-ads', title: 'Facebook & Instagram Ads', description: 'Scroll-stopping creative and thoughtful targeting for modern brands.', icon: Megaphone, features: ['Campaign setup', 'Creative direction', 'Audience targeting', 'Testing and optimization'] },
  { slug: 'social-media', title: 'Social Media Management', description: 'A consistent, considered social presence that sounds like your brand.', icon: Sparkles, features: ['Content calendars', 'Creative production', 'Community guidance', 'Monthly insights'] },
  { slug: 'ui-ux-design', title: 'UI/UX Design', description: 'Clear, intuitive product experiences that feel effortless to use.', icon: Brush, features: ['User flows and wireframes', 'Interface systems', 'Prototyping', 'Design handoff'] },
  { slug: 'branding', title: 'Branding & Logo Design', description: 'Distinctive visual systems built to be remembered and repeated.', icon: Palette, features: ['Logo systems', 'Visual direction', 'Brand guidelines', 'Campaign-ready assets'] },
  { slug: 'maintenance', title: 'Maintenance & Support', description: 'Reliable technical partnership for everything that happens after launch.', icon: Wrench, features: ['Security and updates', 'Content changes', 'Technical support', 'Ongoing improvements'] },
]

export const projects = [
  { slug: 'northstar-studio', title: 'Northstar Studio', category: 'Business Websites', description: 'A confident digital home for an architecture practice with a point of view.', stack: ['Next.js', 'Strategy', 'UI/UX'], accent: 'from-cyan-400/30 via-blue-500/20 to-transparent' },
  { slug: 'form-and-function', title: 'Form & Function', category: 'E-commerce', description: 'A considered shopping experience for a modern furniture label.', stack: ['E-commerce', 'Art Direction', 'SEO'], accent: 'from-violet-400/25 via-blue-500/20 to-transparent' },
  { slug: 'local-foundry', title: 'Local Foundry', category: 'Digital Campaigns', description: 'A local growth system designed to connect a neighborhood brand with its next customers.', stack: ['Local SEO', 'Google Ads', 'Content'], accent: 'from-amber-300/25 via-cyan-400/15 to-transparent' },
]

export const posts = [
  { slug: 'website-that-works-harder', category: 'Web Development', title: 'What makes a website work harder for your business?', excerpt: 'A practical look at the decisions that turn a digital presence into a real business asset.', date: 'May 14, 2026', read: '6 min read' },
  { slug: 'local-search-foundations', category: 'Google Business Profile', title: 'The local search foundations worth getting right', excerpt: 'Clarity, consistency, and useful information still win the local search game.', date: 'April 28, 2026', read: '5 min read' },
  { slug: 'digital-presence-reset', category: 'Business Growth', title: 'A better way to reset your digital presence', excerpt: 'Before adding more channels, make the ones you have work together.', date: 'April 10, 2026', read: '7 min read' },
]

export const navServices = services.slice(0, 6)
export const principles = [
  { icon: Blocks, title: 'Built around your business', text: 'No cookie-cutter packages. We connect strategy, design, and technology to the way you actually work.' },
  { icon: LineChart, title: 'Designed for momentum', text: 'Every touchpoint has a job: earn attention, build trust, or make the next step easier.' },
  { icon: Settings2, title: 'A partner after launch', text: 'We stay close to the details so your digital presence keeps getting better.' },
]

export const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}` : '#'
export const businessEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@nexvault.example'
export const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || 'Add your phone number'
export const officeLocation = process.env.NEXT_PUBLIC_OFFICE_LOCATION || 'Internationally remote'

export function getService(slug: string) { return services.find((service) => service.slug === slug) }
export function getProject(slug: string) { return projects.find((project) => project.slug === slug) }
export function getPost(slug: string) { return posts.find((post) => post.slug === slug) }

export const Icon = { Code2 }

export const allCategories = ['All Projects', 'Business Websites', 'E-commerce', 'UI/UX', 'Branding', 'Digital Campaigns']
export const processSteps = ['Discover', 'Plan', 'Design', 'Develop', 'Launch', 'Grow']

export const logoMark = '<path d="M5 17V7.8L8.1 5l3.9 3.3L15 5v12l-3-2.5L8.1 17V9.9L5 7.8" />'

export const serviceIconMap = { Code2, ShoppingBag, Store, Globe2, Search, Target, Megaphone, Sparkles, Brush, Palette, Wrench }

export const accentWords = { heading: 'Unlock your digital potential.', eyebrow: 'Build. Rank. Grow.' }

export const packageTypes = ['Business Websites', 'E-commerce Websites', 'SEO Services', 'Google Business Profile', 'Social Media Advertising', 'Website Maintenance']

export const footerServices = [services[0], services[4], services[2], services[5], services[7]]

export const navigation = [{ label: 'About', href: '/about' }, { label: 'Services', href: '/services' }, { label: 'Portfolio', href: '/portfolio' }, { label: 'Pricing', href: '/pricing' }, { label: 'Blog', href: '/blog' }, { label: 'Contact', href: '/contact' }]

export const featureIcons = [Code2, Search, Megaphone]

export const agencyStats = [{ value: '01', label: 'Clear direction' }, { value: '02', label: 'Sharp execution' }, { value: '03', label: 'Long-term support' }]

export const serviceDecor = { icon: Globe2 }

export const projectIcon = { icon: Globe2 }

export const businessWebsiteFeatures = ['Strategy workshop', 'Responsive design system', 'CMS-ready build', 'Launch support']

export const faqItems = [{ q: 'How do projects begin?', a: 'We start with a focused conversation about your goals, audience, and current challenges. From there, we recommend the clearest next step.' }, { q: 'Do you work with international clients?', a: 'Yes. Nexvault is built to work with ambitious businesses across time zones and markets.' }, { q: 'Do you guarantee rankings or advertising results?', a: 'No. We build disciplined strategies, measure the right signals, and improve over time without making guarantees we cannot responsibly make.' }]

export const techLines = ['Strategy', 'Design', 'Build', 'Growth']

export const quoteServices = services.map((service) => service.title)

export const legalNav = [{ label: 'Privacy Policy', href: '/privacy-policy' }, { label: 'Terms & Conditions', href: '/terms' }]

export const topNav = [{ label: 'Home', href: '/' }, ...navigation]

export const serviceVisuals = [Code2, Search, Megaphone, ShoppingBag]

export const aboutValues = ['Clarity over complexity', 'Craft over shortcuts', 'Partnership over handoff']

export const contactFields = ['Name', 'Email', 'Company', 'Project details']

export const footerLinks = [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }, { label: 'Portfolio', href: '/portfolio' }, { label: 'Contact', href: '/contact' }]

export const serviceGroup = [services.slice(0, 4), services.slice(4, 8), services.slice(8)]

export const demoLabel = 'Demonstration project'

export const companyName = 'Nexvault Technologies'

export const tagline = 'Unlock Your Digital Potential'

export const secondaryTagline = 'Build. Rank. Grow.'

export const serviceCount = services.length

export const projectCount = projects.length

export const blogCount = posts.length

export const websiteFeatures = ['Fast, responsive builds', 'Accessible by default', 'Search-ready foundations']

export const heroPoints = ['Websites that earn trust', 'Visibility that compounds', 'Support that stays close']

export const ctaCopy = "Let's build a digital presence that works for your business."

export const footerCopy = 'Unlock Your Digital Potential.'

export const legalCopy = 'The information on this website is for general information purposes and does not constitute a guarantee of business, advertising, or search performance.'

export const serviceCategories = ['Web', 'Visibility', 'Growth', 'Brand']

export const blogCategories = ['Web Development', 'SEO', 'Google Business Profile', 'Digital Marketing', 'Business Growth']

export const primaryCta = 'Get a Free Quote'

export const secondaryCta = 'Explore Services'

export const navAria = 'Main navigation'

export const formSuccess = 'Thanks — your note is in. We will be in touch shortly.'

export const formError = 'Something went wrong. Please try again or email us directly.'

export const noResults = 'No projects in this category yet.'

export const contactMessage = 'Tell us what you are building, improving, or figuring out.'

export const footerNote = 'Independent digital strategy, design, and engineering for ambitious businesses.'

export const serviceIntro = 'The right mix of strategy, craft, and technology for the next stage of your business.'

export const aboutIntro = 'Nexvault helps businesses turn scattered digital activity into a clear, credible growth system.'

export const pricingIntro = 'Every business starts from a different place. We scope the right engagement instead of forcing you into a rigid package.'

export const blogIntro = 'Notes on building a better digital presence.'

export const portfolioIntro = 'A selection of demonstration work showing how we think, design, and build.'

export const contactIntro = 'Have a project in mind? Share a little context and we will come back with a thoughtful next step.'

export const quoteIntro = 'Give us the useful details. We will give you a clear path forward.'

export const year = 2026

export const brandInitial = 'N'

export const navCtaHref = '/get-a-quote'

export const mainContainer = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10'

export const sectionPadding = 'py-20 md:py-28'

export const buttonArrow = '↗'

export const statusLabel = 'Currently accepting select projects'

export const supportLine = 'Built for clarity. Made to move.'

export const gradientText = 'bg-gradient-to-r from-white via-white to-cyan-300 bg-clip-text text-transparent'

export const defaultMeta = { title: companyName, description: aboutIntro }

export const legalSections = [{ title: 'Information we collect', text: 'We only collect information you choose to share through our inquiry forms or direct contact channels.' }, { title: 'How we use it', text: 'Information is used to respond to requests, scope projects, and improve our services. We do not sell personal information.' }, { title: 'Questions', text: 'For questions about this policy, contact the configured business email.' }]

export const termsSections = [{ title: 'Using this website', text: 'You may use this website for lawful purposes and should not attempt to interfere with its operation or security.' }, { title: 'Project engagements', text: 'Specific deliverables, timelines, and fees are agreed in writing before work begins.' }, { title: 'No guarantees', text: 'Digital performance depends on many factors. We do not guarantee search rankings, approvals, leads, or revenue.' }]

export const heroOrb = 'hero-orb'

export const gridClass = 'bg-grid'

export const glassClass = 'glass'

export const pageTitle = (title: string) => `${title} — ${companyName}`

export const projectCategories = [...allCategories]

export const socialLinks = [{ label: 'Instagram', href: '#' }, { label: 'LinkedIn', href: '#' }, { label: 'Facebook', href: '#' }]

export const mobileMenuLabel = 'Open navigation'

export const footerHeading = 'Let's make something useful.'

export const pageEyebrow = 'Nexvault Technologies'

export const ctaHeading = 'Ready to take your business to the next level?'

export const workWithUs = 'Start a conversation'

export const serviceCta = 'Talk through your project'

export const blogCta = 'Read the article'

export const portfolioCta = 'View project'

export const quoteCta = 'Send project brief'

export const contactCta = 'Send inquiry'

export const servicePageLabel = 'What we do'

export const portfolioPageLabel = 'Selected work'

export const blogPageLabel = 'Journal'

export const aboutPageLabel = 'The studio'

export const pricingPageLabel = 'Ways to work together'

export const contactPageLabel = 'Start a conversation'

export const quotePageLabel = 'Project brief'

export const legalPageLabel = 'Nexvault policies'

export const corePromise = 'A digital presence with a point of view.'

export const heroSubheading = 'We build websites, grow brands, and drive digital success.'

export const aboutValuesTitle = 'The details matter.'

export const processIntro = 'A clear process keeps the work focused, collaborative, and moving forward.'

export const processDescription = 'We remove the guesswork from digital work by making the next step visible at every stage.'

export const placeholderImage = '/placeholder.jpg'

export const logoAlt = 'Nexvault Technologies'

export const pageShell = 'min-h-screen bg-[#0B1120] text-white'

export const muted = 'text-slate-400'

export const border = 'border-white/10'

export const accent = 'text-cyan-300'

export const surface = 'bg-[#111C30]'

export const primaryBlue = '#3B82F6'

export const cyan = '#06B6D4'

export const darkNavy = '#0B1120'

export const slate = '#94A3B8'

export const fontHeading = 'Space Grotesk'

export const fontBody = 'Inter'

export const defaultCountry = 'International'

export const formNote = 'No pressure, no generic pitch. Just a useful first conversation.'

export const menuItems = topNav

export const legalUpdated = 'Last updated: October 2026'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexvault.example'

export const canonical = siteUrl

export const metadataKeywords = ['web development', 'SEO', 'Google Business Profile', 'digital marketing', 'Nexvault']

export const schemaType = 'Organization'

export const organizationDescription = 'International technology and digital growth agency.'

export const siteName = 'Nexvault'

export const logoText = 'NEXVAULT'

export const logoSubtext = 'TECHNOLOGIES'

export const logoStroke = 'currentColor'

export const iconSize = 20

export const heroKicker = 'Independent digital studio'

export const heroBadge = 'Strategy · Design · Engineering'

export const serviceCardCta = 'Learn more'

export const portfolioFilterLabel = 'Filter by discipline'

export const newsletterText = 'Useful notes, occasionally.'

export const newsletterCta = 'Subscribe'

export const formPrivacy = 'By submitting, you agree to be contacted about your inquiry.'

export const accessibilityNote = 'Designed with accessible color contrast, keyboard navigation, and reduced motion in mind.'

export const contactConfigNote = 'Replace the example contact values with real business details before launch.'

export const envKeys = ['NEXT_PUBLIC_BUSINESS_EMAIL', 'NEXT_PUBLIC_BUSINESS_PHONE', 'NEXT_PUBLIC_WHATSAPP_NUMBER', 'NEXT_PUBLIC_OFFICE_LOCATION', 'NEXT_PUBLIC_SITE_URL', 'RESEND_API_KEY', 'CONTACT_TO_EMAIL']

export const allPages = ['/', '/about', '/services', '/portfolio', '/pricing', '/blog', '/contact', '/get-a-quote', '/privacy-policy', '/terms']

export const pageCount = allPages.length

export const placeholderProjectNote = 'Demonstration concept — replace with verified client work when available.'

export const noTestimonials = true

export const noStats = true

export const noGuarantees = true

export const designDirection = 'Premium, credible, dark technology studio.'

export const visualKeywords = ['electric blue', 'cyan', 'navy', 'glass', 'grid']

export const ready = true

export const version = '1.0'

export const contentStatus = 'Ready to customize'

export const finalNote = 'Supply real business contact details, email provider credentials, social URLs, and verified portfolio outcomes before launch.'

export const servicePromise = 'Good digital work should feel clear.'

export const contactHeading = 'Tell us what is next.'

export const quoteHeading = 'Let's make the next move clear.'

export const homeHeading = 'Digital work with a point of view.'

export const homeDescription = 'Nexvault Technologies helps ambitious businesses show up clearly, get found, and grow with confidence.'

export const homeCallout = 'Build. Rank. Grow.'

export const homeTrust = 'The right partner for the work between idea and impact.'

export const routeError = 'Page not found'

export const routeBack = 'Back to home'

export const navServicesLabel = 'Services'

export const menuClose = 'Close navigation'

export const socialAria = 'Social links'

export const whatsappLabel = 'Chat on WhatsApp'

export const copyright = '© 2026 Nexvault Technologies. All Rights Reserved.'

export const quoteBudgetOptions = ['Under $2,500', '$2,500–$5,000', '$5,000–$10,000', '$10,000+']

export const timelineOptions = ['ASAP', '1–2 months', '3–6 months', 'Exploring']

export const formAction = '/api/contact'

export const contactApiNote = 'Connect this route to your email provider before launch.'

export const businessDetailsNeeded = ['Business email', 'Phone and WhatsApp number', 'Office or service area', 'Social profile URLs']

export const activeNav = 'text-white'

export const inactiveNav = 'text-slate-400'

export const gradientBorder = 'border-white/10'

export const hoverLift = 'transition duration-300 hover:-translate-y-1'

export const reducedMotion = 'motion-reduce:transition-none'

export const seoTitle = 'Digital strategy, design, and growth'

export const seoDescription = 'Nexvault Technologies builds clear, credible digital experiences for ambitious businesses.'

export const metadataImage = '/placeholder.jpg'

export const contactEmailLabel = 'Business email'

export const phoneLabel = 'Phone'

export const locationLabel = 'Office / service area'

export const navHomeLabel = 'Home'

export const projectDetailLabel = 'Project detail'

export const serviceDetailLabel = 'Service detail'

export const blogDetailLabel = 'Article'

export const contentWidth = 'max-w-7xl'

export const bodyWidth = 'max-w-3xl'

export const eyebrowClass = 'text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300'

export const displayClass = 'font-heading text-5xl font-medium tracking-[-0.06em] md:text-7xl'

export const leadClass = 'text-lg leading-8 text-slate-300'

export const sectionTitleClass = 'font-heading text-3xl font-medium tracking-[-0.04em] md:text-5xl'

export const cardClass = 'rounded-3xl border border-white/10 bg-white/[0.04]'

export const inputClass = 'h-12 rounded-xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500'

export const selectClass = inputClass

export const textareaClass = 'min-h-36 rounded-xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500'

export const buttonClass = 'rounded-full'

export const pageBackground = 'bg-[#0B1120]'

export const sectionBackground = 'bg-[#111C30]/70'

export const subtleBlue = 'bg-blue-500/10'

export const subtleCyan = 'bg-cyan-400/10'

export const subtlePurple = 'bg-violet-400/10'

export const defaultFormMethod = 'POST'

export const formEndpoint = '/api/contact'

export const pageTransition = 'transition-all duration-500'

export const pageGrid = 'absolute inset-0 bg-grid opacity-50'

export const heroLine = 'absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 rotate-[-24deg] bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent'

export const orbClass = 'absolute rounded-full bg-blue-500/20 blur-3xl'

export const codeName = 'Nexvault Technologies'

export const projectType = 'Demonstration project'

export const emailPlaceholder = 'you@company.com'

export const fieldRequired = 'This field is required.'

export const emailInvalid = 'Enter a valid email.'

export const formLoading = 'Sending…'

export const formSend = 'Send inquiry'

export const formQuote = 'Send project brief'

export const formSelect = 'Select an option'

export const serviceSelect = 'What can we help with?'

export const projectPlaceholder = 'A little about your goals, audience, and what success looks like…'

export const contactPlaceholder = 'Tell us about your project…'

export const quotePlaceholder = 'What are you hoping to build or improve?'

export const privacyMessage = 'Your details stay private and are only used to respond to your request.'

export const contactSupport = 'Prefer email? Reach us directly using the configured address.'

export const safeHarbor = 'We believe in clear expectations and honest communication.'

export const notFoundMessage = 'This page is not part of the current studio map.'

export const notFoundCta = 'Return home'

export const pageSlug = (slug: string) => slug.replaceAll('-', ' ')

export const formatTitle = (title: string) => title

export const iconFor = (service: Service) => service.icon

export const articleBody = 'Useful digital work begins with a clear problem, a considered solution, and a willingness to learn from what happens next.'

export const portfolioBody = 'Every project starts with a question. The work is making the answer visible, useful, and unmistakably yours.'

export const aboutBody = 'We are a small, senior-led digital studio for businesses that care about how they show up. We bring strategy, design, and engineering into one thoughtful process.'

export const pricingBody = 'Tell us where you are and where you want to go. We will shape a scope around the work that matters.'

export const serviceBody = 'From first impression to ongoing growth, we make digital work feel less fragmented and more effective.'

export const footerCta = 'Have a good problem?'

export const footerCtaDescription = 'Bring us the context. We will bring a clear next step.'

export const contactHours = 'Replies typically within 2 business days.'

export const launchChecklist = ['Replace example contact details', 'Connect email delivery', 'Add verified portfolio work', 'Review legal copy']

export const configNote = 'Configuration-driven contact details keep the site ready for a real launch.'

export const externalTarget = '_blank'

export const relNoopener = 'noreferrer'

export const ctaArrow = 'ArrowUpRight'

export const defaultIcon = Sparkles

export const metadataBase = siteUrl

export const companyLegalName = companyName

export const canonicalPath = '/'

export const altText = (name: string) => `${name} — Nexvault Technologies`

export const safeText = (value: string) => value

export const currentYear = year

export const allServiceSlugs = services.map((service) => service.slug)

export const allProjectSlugs = projects.map((project) => project.slug)

export const allPostSlugs = posts.map((post) => post.slug)

export const hasContactConfig = Boolean(process.env.NEXT_PUBLIC_BUSINESS_EMAIL)

export const formDisclaimer = 'Please do not include passwords, payment details, or other sensitive information.'

export const websiteName = companyName

export const mainTitle = tagline

export const secondaryTitle = secondaryTagline

export const navLinks = topNav

export const noFakeClaims = true

export const contentReady = true

export const implementationNote = 'Core pages use maintainable data arrays and dynamic routes.'

export const systemFontNote = 'Typography is loaded through next/font.'

export const pageDescription = seoDescription

export const ogTitle = `${companyName} — ${tagline}`

export const ogDescription = seoDescription

export const brand = { name: companyName, shortName: siteName, tagline, secondaryTagline }

export const coreServices = services

export const portfolioProjects = projects

export const blogPosts = posts

export const allNavigation = topNav

export const legalLinks = legalNav

export const contactDetails = { email: businessEmail, phone: businessPhone, location: officeLocation }

export const quoteDetails = { services: quoteServices, budgets: quoteBudgetOptions, timelines: timelineOptions }

export const pageLabels = { services: servicePageLabel, portfolio: portfolioPageLabel, blog: blogPageLabel, about: aboutPageLabel, pricing: pricingPageLabel, contact: contactPageLabel, quote: quotePageLabel }

export const footerData = { links: footerLinks, services: footerServices, socials: socialLinks }

export const content = { homeHeading, homeDescription, aboutIntro, serviceIntro, portfolioIntro, blogIntro, pricingIntro, contactIntro, quoteIntro }

export const theme = { bg: darkNavy, surface: '#111C30', blue: primaryBlue, cyan, text: '#FFFFFF', muted: slate }

export const isConfigured = Boolean(process.env.NEXT_PUBLIC_BUSINESS_EMAIL && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)

export const launchNote = 'This build intentionally avoids invented contact details, testimonials, and performance claims.'

export const all = { services, projects, posts, navigation }

export const defaultRoute = '/'

export const canonicalRoutes = allPages

export const siteConfig = { name: companyName, url: siteUrl, description: seoDescription, email: businessEmail, phone: businessPhone, location: officeLocation }

export const visual = { primary: primaryBlue, accent: cyan, background: darkNavy, secondary: '#111C30' }

export const copy = { tagline, secondaryTagline, ctaHeading, ctaCopy, footerNote }

export const status = { label: statusLabel, configured: isConfigured }

export const brandAssets = { logo: logoText, subtext: logoSubtext, mark: logoMark }

export const formConfig = { endpoint: formEndpoint, privacy: formPrivacy }

export const release = { version, year, status: contentStatus }

export const primaryNavigation = navigation

export const allContent = { services, projects, posts, principles, processSteps }

export const defaultService = services[0]

export const defaultProject = projects[0]

export const defaultPost = posts[0]

export const seo = { title: seoTitle, description: seoDescription, keywords: metadataKeywords }

export const contact = { email: businessEmail, phone: businessPhone, location: officeLocation, whatsapp: whatsappUrl }

export const footer = { copyright, note: footerNote }

export const legal = { privacy: legalSections, terms: termsSections, updated: legalUpdated }

export const asset = { placeholder: placeholderImage }

export const build = { ready, version }

export const copyDeck = { hero: { kicker: heroKicker, badge: heroBadge, heading: homeHeading, subheading: heroSubheading, description: homeDescription }, cta: { heading: ctaHeading, description: ctaCopy } }

export const app = { name: companyName, tagline, navigation: topNav }

export const routes = allPages

export const labels = { logo: logoAlt, menu: mobileMenuLabel, close: menuClose }

export const palette = { background: darkNavy, surface: '#111C30', primary: primaryBlue, accent: cyan, muted: slate }

export const metadataConfig = { title: ogTitle, description: ogDescription, base: metadataBase }

export const api = { contact: formEndpoint }

export const current = { year, siteUrl }

export const launch = { needed: businessDetailsNeeded, checklist: launchChecklist }

export const copyStatus = { demos: true, verifiedResults: false }

export const footerNavigation = footerLinks

export const projectNavigation = projects

export const relatedServices = services

export const relatedPosts = posts

export const homeServices = services

export const site = { companyName, tagline, secondaryTagline, theme }

export const details = { businessEmail, businessPhone, officeLocation }

export const config = { envKeys, isConfigured }

export const contentMap = { service: services, project: projects, blog: posts }

export const componentTokens = { mainContainer, sectionPadding, eyebrowClass, displayClass, leadClass, cardClass }

export const routeLabels = { service: serviceDetailLabel, project: projectDetailLabel, blog: blogDetailLabel }

export const finalContent = { home: content, footer: footerData, legal }

export const implementation = { pages: allPages, dynamic: ['/services/[slug]', '/portfolio/[slug]', '/blog/[slug]'] }

export const readyForCustomization = true

export const noPlaceholderClaims = true

export const noRealContactDetails = !hasContactConfig

export const end = true
