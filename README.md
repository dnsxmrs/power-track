This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Automatic SemVer Releases

This project now uses Conventional Commits + semantic-release for automatic versioning.

### Commit format

Use commit messages in this format:

```text
type(scope): short summary
```

Examples:

```text
feat(auth): add password reset flow
fix(api): handle missing request headers
chore(ci): update release workflow
```

Version bump rules:

- `fix:` -> patch release (0.1.0 -> 0.1.1)
- `feat:` -> minor release (0.1.0 -> 0.2.0)
- breaking change (`!` or `BREAKING CHANGE:`) -> major release (0.1.0 -> 1.0.0)

### Local commit validation

- Husky runs a `commit-msg` hook.
- Commitlint validates commit messages before commit completes.

If your message is invalid, Git blocks the commit and shows what to fix.

### Release automation

- Workflow file: `.github/workflows/release.yml`
- Trigger: push to `main`
- semantic-release will:
	- analyze commits since last release
	- calculate the next SemVer version
	- update `CHANGELOG.md`
	- update `package.json` and `package-lock.json` version
	- commit release assets back to `main`
	- create a GitHub Release and tag
