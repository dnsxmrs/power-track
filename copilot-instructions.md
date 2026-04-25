# Power Track Guidelines

## Architecture
- Prefer Next.js App Router patterns.
- Default `page.tsx` files to server components.
- Keep client components only where interactivity is required.
- Separate client and server boundaries clearly.
- Use Server Actions for mutations and form submissions whenever possible.
- Put business logic, core logic, and data-fetching helpers in an `_actions` folder or nearby server-only modules.

## SEO
- Prioritize SEO for all public-facing pages.
- Keep metadata close to the route, ideally in server component pages or route-level metadata exports.
- Prefer server-rendered content for crawlable and indexable pages.
- Structure headings, titles, descriptions, and semantic markup carefully.

## Rendering And UX
- Use lazy loading for heavy or non-critical components.
- Show skeletons or loading states so pages feel instant.
- Optimize for fast initial display and progressive enhancement.
- Keep loading boundaries small and targeted.

## Code Quality
- Favor modular, reusable components.
- Keep server-only logic on the server.
- Keep client components small and focused.
- Avoid mixing fetching, mutation, and presentation logic in the same file when it reduces clarity.
