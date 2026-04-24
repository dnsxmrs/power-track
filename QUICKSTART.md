# Quick Start Guide - Router-Based Next.js App

## ✅ Refactoring Complete

Your Power Track app has been converted from React Router to Next.js file-based routing.

## 🚀 Next Steps

### 1. Install Dependencies (if needed)

```bash
npm install
# or
yarn install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 3. Test Authentication Flow

- App will redirect you to `/login` (unauthenticated)
- Click "Sign In" to login
- You'll be redirected to `/dashboard`
- Click sidebar items to navigate
- Click logout button to return to login

### 4. (Optional) Clean Up Old Files

Delete these folders/files as they're no longer used:

```bash
rm -rf src/app/pages/    # Old component-based pages
```

## 📁 Route Structure

| URL | File |
| ----- | ------ |
| `/` | Redirects to `/login` or `/dashboard` |
| `/login` | `src/app/login/page.tsx` |
| `/dashboard` | `src/app/(auth)/dashboard/page.tsx` |
| `/devices` | `src/app/(auth)/devices/page.tsx` |
| `/alerts` | `src/app/(auth)/alerts/page.tsx` |
| `/reports` | `src/app/(auth)/reports/page.tsx` |
| `/branches` | `src/app/(auth)/branches/page.tsx` |
| `/settings` | `src/app/(auth)/settings/page.tsx` |

## 🔄 Navigation Examples

### Programmatic Navigation

```typescript
'use client';
import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/dashboard');
  };
  
  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### Link Component (for static links)

```typescript
import Link from 'next/link';

export default function MyComponent() {
  return <Link href="/dashboard">Dashboard</Link>;
}
```

## 🛡️ How Authentication Works

1. **Root Layout** wraps entire app with `AuthProvider`
2. **Root Page** checks auth status and redirects
3. **(auth) Layout** protects all routes in that group
   - Redirects unauthenticated users to `/login`
   - Renders Sidebar and main content for authenticated users
4. **Login Page** is outside (auth) group - anyone can access it

## 🎨 Key Files

- `src/app/layout.tsx` - Root layout with AuthProvider
- `src/app/(auth)/layout.tsx` - Authenticated routes layout
- `src/app/context/AuthContext.tsx` - Authentication state
- `src/app/components/Sidebar.tsx` - Navigation menu

## 🐛 Troubleshooting

### "Module not found" errors

- Run `npm install` to ensure all dependencies are installed
- Check that imports use correct relative paths

### Navigation not working

- Ensure you're using `useRouter` from `next/navigation` (not `next/router`)
- Use `router.push()` instead of React Router's `navigate()`

### Auth redirect issues

- Check `AuthContext.tsx` is properly initialized
- Verify localStorage is accessible in your environment
- Check browser console for errors

## 📚 Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [next/navigation](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)

---

**Happy coding!** 🚀
