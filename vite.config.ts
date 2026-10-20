import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { content } from './src/data/content'
import { isPlaceholder } from './src/lib/placeholder'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function publicAssetExists(assetUrl: string): boolean {
  if (!assetUrl.startsWith('/') || isPlaceholder(assetUrl)) return true

  const segments = assetUrl.split(/[?#]/, 1)[0].split('/').filter(Boolean)
  let currentPath = resolve(process.cwd(), 'public')

  for (const segment of segments) {
    let entries: string[]
    try {
      entries = readdirSync(currentPath)
    } catch {
      return false
    }
    if (!entries.includes(segment)) return false
    currentPath = resolve(currentPath, segment)
  }

  try {
    return statSync(currentPath).isFile()
  } catch {
    return false
  }
}

/** Warns in the dev server when a configured local asset is missing or mis-cased. */
function warnForMissingPublicAssets(): Plugin {
  return {
    name: 'warn-for-missing-public-assets',
    configureServer() {
      const assetUrls = [
        '/favicon.svg',
        content.person.resumeUrl,
        content.person.photo.src,
        ...content.projects.items.map((project) => project.image),
      ]
      for (const assetUrl of new Set(assetUrls)) {
        if (!publicAssetExists(assetUrl)) {
          console.warn(`[asset-check] Missing public asset: ${assetUrl}`)
        }
      }
    },
  }
}

/** Injects meta / Open Graph / JSON-LD from content.ts and emits robots.txt + sitemap.xml. */
function seo(): Plugin {
  const { site, person, skills } = content
  const url = site.url.replace(/\/$/, '')
  const absolute = (path: string) => new URL(path, `${url}/`).href
  const ogImage = isPlaceholder(site.ogImage) ? null : absolute(site.ogImage)
  const sameAs = [person.socials.github, person.socials.linkedin].filter((v) => !isPlaceholder(v))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url,
    jobTitle: site.jobTitle,
    description: site.description,
    alumniOf: { '@type': 'CollegeOrUniversity', name: person.college },
    knowsAbout: skills.groups.flatMap((g) => g.items),
    ...(sameAs.length ? { sameAs } : {}),
    ...(isPlaceholder(person.email) ? {} : { email: `mailto:${person.email}` }),
    ...(isPlaceholder(person.photo.src) ? {} : { image: absolute(person.photo.src) }),
  }

  const tags = [
    `<title>${esc(site.title)}</title>`,
    `<meta name="description" content="${esc(site.description)}" />`,
    `<meta name="keywords" content="${esc(site.keywords.join(', '))}" />`,
    `<meta name="author" content="${esc(person.name)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta name="theme-color" content="#050507" />`,
    `<link rel="canonical" href="${esc(url)}/" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${esc(person.name)}" />`,
    `<meta property="og:title" content="${esc(site.title)}" />`,
    `<meta property="og:description" content="${esc(site.description)}" />`,
    `<meta property="og:url" content="${esc(url)}/" />`,
    `<meta property="og:locale" content="${esc(site.locale)}" />`,
    ...(ogImage
      ? [
          `<meta property="og:image" content="${esc(ogImage)}" />`,
          `<meta property="og:image:alt" content="${esc(site.title)}" />`,
          `<meta name="twitter:image" content="${esc(ogImage)}" />`,
        ]
      : []),
    `<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(site.title)}" />`,
    `<meta name="twitter:description" content="${esc(site.description)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ]

  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      return html.replace('<!--seo-->', tags.join('\n    '))
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), warnForMissingPublicAssets(), seo()],
})
