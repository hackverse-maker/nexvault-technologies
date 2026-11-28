'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { MediaImg } from './media-image'
import type { PortfolioProject } from '@/lib/projects'

type GridItem = Omit<PortfolioProject, 'link'> & { link?: string | null }

/**
 * Filterable portfolio grid shared by the portfolio page section and any
 * CMS "portfolio" section. Cards show real imagery, tech, and links.
 */
export function PortfolioGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState('All Projects')

  const categories = useMemo(() => {
    const seen: string[] = []
    for (const item of items) {
      if (item.category && !seen.includes(item.category)) seen.push(item.category)
    }
    return ['All Projects', ...seen]
  }, [items])

  const visible = useMemo(
    () => (filter === 'All Projects' ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  )

  return (
    <div>
      <div className="portfolio-filters" role="tablist" aria-label="Filter projects by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={filter === cat}
            className={`portfolio-filter ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="portfolio-grid">
        {visible.map((project) => (
          <article className="portfolio-card" key={project.slug || project.title}>
            <Link href={`/portfolio/${project.slug}`} className="portfolio-card-media" aria-label={`View ${project.title}`}>
              {project.image ? (
                <MediaImg src={project.image} alt={project.title} />
              ) : (
                <div className="portfolio-card-fallback">
                  <span>{project.category}</span>
                </div>
              )}
              {project.demo && <span className="portfolio-demo-badge">Demo</span>}
            </Link>
            <div className="portfolio-card-body">
              <p className="portfolio-card-category">{project.category}</p>
              <h3>{project.title}</h3>
              {project.description && <p className="portfolio-card-desc">{project.description}</p>}
              {project.tech.length > 0 && (
                <ul className="portfolio-tech">
                  {project.tech.slice(0, 4).map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
              <div className="portfolio-card-actions">
                <Link className="portfolio-view" href={`/portfolio/${project.slug}`}>
                  View project <ArrowRight size={14} />
                </Link>
                {project.link && (
                  <a className="portfolio-live" href={project.link} target="_blank" rel="noopener noreferrer">
                    Live site <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="portfolio-empty">No projects in this category yet.</p>
        )}
      </div>
    </div>
  )
}
