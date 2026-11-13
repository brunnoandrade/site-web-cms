import type { Tenant } from '@/lib/cms'

/** Crawlers that collect pages to train AI models (blocked by `blockAiCrawlers`). */
export const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'PerplexityBot',
  'Bytespider',
  'Applebot-Extended',
  'cohere-ai',
  'Meta-ExternalAgent',
]

/**
 * robots.txt of a property, pointing to its own sitemap index. Blocked properties (DEV/HML) close
 * everything; the editor's extra rules only apply to open ones.
 */
export const robotsTxt = (
  tenant: Pick<Tenant, 'siteUrl' | 'blockIndexing' | 'blockAiCrawlers' | 'robotsExtra'>,
): string => {
  const rules = tenant.blockIndexing
    ? ['Disallow: /']
    : [
        'Disallow: /next/',
        'Disallow: /api/',
        ...(tenant.robotsExtra ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      ]

  // Own groups: a crawler follows the most specific `User-agent` group that names it.
  const ai =
    tenant.blockAiCrawlers && !tenant.blockIndexing
      ? AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, 'Disallow: /', ''])
      : []

  return ['User-agent: *', ...rules, '', ...ai, `Sitemap: ${tenant.siteUrl}/sitemap.xml`, ''].join(
    '\n',
  )
}
