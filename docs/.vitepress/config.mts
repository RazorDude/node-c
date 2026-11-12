import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'NodeC',
    description:
      'A batteries-included NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.',
    // served from https://razordude.github.io/node-c/
    base: '/node-c/',
    cleanUrls: true,
    lastUpdated: true,
    vite: {
      // mermaid imports the CommonJS fastdom package, which vitepress-plugin-mermaid doesn't pre-bundle
      optimizeDeps: { include: ['fastdom', 'fastdom/extensions/fastdom-promised.js'] }
    },
    themeConfig: {
      // every page has its own Previous / Next links, which also work on GitHub
      docFooter: { prev: false, next: false },
      nav: [
        { text: 'First steps', link: '/first-steps' },
        { text: 'Recipes', link: '/Recipes/' },
        { text: 'FAQ', link: '/faq' },
        { text: 'Changelog', link: 'https://github.com/RazorDude/node-c/blob/master/changelog.md' }
      ],
      outline: { level: [2, 3] },
      search: { provider: 'local' },
      sidebar: [
        {
          text: 'Introduction',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'First steps', link: '/first-steps' }
          ]
        },
        {
          text: 'Overview',
          link: '/Overview/',
          items: [
            { text: 'Layers and modules', link: '/Overview/layers' },
            { text: 'Controllers', link: '/Overview/controllers' },
            { text: 'Domain services', link: '/Overview/domain-services' },
            { text: 'Request lifecycle', link: '/Overview/request-lifecycle' }
          ]
        },
        {
          text: 'Fundamentals',
          link: '/Fundamentals/',
          items: [
            { text: 'Configuration and startup', link: '/Fundamentals/configuration' },
            { text: 'Logging', link: '/Fundamentals/logging' },
            { text: 'Multiple data services', link: '/Fundamentals/multiple-data-services' },
            { text: 'HTTP API module', link: '/Fundamentals/http-module' },
            { text: 'Core utilities', link: '/Fundamentals/core-utilities' }
          ]
        },
        {
          text: 'Data',
          link: '/Data/',
          items: [
            { text: 'Defining entities', link: '/Data/entities' },
            { text: 'Query filters', link: '/Data/query-filters' },
            { text: 'Relational databases', link: '/Data/rdb' },
            { text: 'Redis / Valkey', link: '/Data/redis' },
            { text: 'ClickHouse', link: '/Data/clickhouse' }
          ]
        },
        {
          text: 'Security',
          link: '/Security/',
          items: [
            { text: 'Authentication', link: '/Security/authentication' },
            { text: 'Access Control', link: '/Security/access-control' },
            { text: 'API keys and CORS', link: '/Security/api-keys-and-cors' }
          ]
        },
        {
          text: 'Recipes',
          link: '/Recipes/',
          items: [
            { text: 'Caching with Redis', link: '/Recipes/caching' },
            { text: 'Audit logs with ClickHouse', link: '/Recipes/audit-logs' },
            { text: 'Adding a permission', link: '/Recipes/adding-a-permission' },
            { text: 'Seeding data', link: '/Recipes/seeding-data' },
            { text: 'Logging in with Okta', link: '/Recipes/okta-login' },
            { text: 'Federated login', link: '/Recipes/federated-login' }
          ]
        },
        {
          text: 'Testing',
          link: '/Testing/',
          items: [{ text: 'End-to-end tests', link: '/Testing/e2e' }]
        },
        {
          text: 'More',
          items: [
            { text: 'FAQ and troubleshooting', link: '/faq' },
            { text: 'Glossary', link: '/glossary' },
            { text: 'Migration guide', link: '/migration-guide' },
            { text: 'Contributing', link: '/contributing' }
          ]
        },
        {
          text: 'AI guides',
          collapsed: true,
          items: [
            { text: 'Main guide', link: '/ai-guide' },
            { text: 'Overview', link: '/Overview/ai-guide' },
            { text: 'Fundamentals', link: '/Fundamentals/ai-guide' },
            { text: 'Data', link: '/Data/ai-guide' },
            { text: 'Security', link: '/Security/ai-guide' },
            { text: 'Testing', link: '/Testing/ai-guide' }
          ]
        }
      ],
      socialLinks: [{ icon: 'github', link: 'https://github.com/RazorDude/node-c' }]
    }
  })
);
