export type Package = {
  name: string
  label: string
  old: string
  price: string
  advance: string
  tone: 'silver' | 'gold' | 'platinum'
  popular?: boolean
  features: string[]
}

export const packages: Package[] = [
  {
    name: 'Silver',
    label: 'Starter Business Package',
    old: 'Rs. 15,000',
    price: 'Rs. 13,500',
    advance: 'Rs. 4,050',
    tone: 'silver',
    features: [
      'Website with 5 sections',
      'Responsive design',
      'Domain + hosting for 1 year',
      'Business email setup',
      'Google Business Profile setup',
      '3 designed social media posts',
      'Facebook + Instagram setup',
      'WhatsApp button',
      'Delivery: 5–7 working days',
    ],
  },
  {
    name: 'Gold',
    label: 'Professional Business Package',
    old: 'Rs. 29,990',
    price: 'Rs. 26,991',
    advance: 'Rs. 8,097.30',
    tone: 'gold',
    popular: true,
    features: [
      'Premium landing page up to 8 sections',
      'Responsive design + animations',
      'Domain + hosting for 1 year',
      '2 custom-domain email mailboxes',
      'Google Business Profile optimization',
      '6 designed social media posts',
      'WhatsApp + contact form',
      'Basic SEO + Google Analytics',
      '15 days bug support',
      'Delivery: 7–10 working days',
    ],
  },
  {
    name: 'Platinum',
    label: 'Complete Digital Business Package',
    old: 'Rs. 45,990',
    price: 'Rs. 41,391',
    advance: 'Rs. 12,417.30',
    tone: 'platinum',
    features: [
      'Premium website up to 5 pages',
      'Custom UI/UX + animations',
      'Domain + hosting for 1 year',
      '3 custom-domain email mailboxes',
      'Google Business Profile optimization',
      '12 designed social media posts',
      'WhatsApp + contact form',
      'On-page SEO + Search Console',
      '30 days bug support',
      'Delivery: 12–18 working days',
    ],
  },
]

export const maintenancePlans = [
  { name: 'Silver', price: 'Rs. 1,500', note: 'Essential updates and security patches' },
  { name: 'Gold', price: 'Rs. 2,500', note: 'Updates, content changes, and priority support' },
  { name: 'Platinum', price: 'Rs. 5,000', note: 'Full care including content, SEO tweaks, and reporting' },
]
