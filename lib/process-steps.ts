export type ProcessStep = {
  title: string
  description: string
}

export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  { title: 'Discover', description: 'We understand your business, goals, audience, and project requirements.' },
  { title: 'Plan', description: 'We define the strategy, project scope, structure, and timeline.' },
  { title: 'Design', description: 'We create the visual direction, layouts, and user experience.' },
  { title: 'Development', description: 'We turn approved designs into a responsive, functional website.' },
  { title: 'Launch', description: 'We test, optimize, and launch your website smoothly.' },
  { title: 'Grow', description: 'We support your growth through ongoing improvements and optimization.' },
]
