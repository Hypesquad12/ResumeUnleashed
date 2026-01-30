# Next.js to React + Vite Migration Guide

**Status:** 🚧 In Progress  
**Date:** January 30, 2026  
**Scope:** Full migration excluding payment gateway integration

---

## ✅ Completed Steps

### 1. **Dependencies Installed**
- ✅ Vite & React plugin
- ✅ React Router DOM

### 2. **Configuration Files Created**
- ✅ `vite.config.ts` - Vite configuration
- ✅ `index.html` - Entry HTML file
- ✅ `src/main.tsx` - React entry point
- ✅ `src/App.tsx` - Main app with routing
- ✅ `.env.local.example` - Environment variables template

### 3. **Core Components Created**
- ✅ `ProtectedRoute.tsx` - Authentication guard
- ✅ `DashboardLayout.tsx` - Dashboard wrapper

### 4. **Package.json Updated**
- ✅ Scripts changed to Vite commands
- ✅ Removed Next.js dependencies
- ✅ Removed Razorpay (payment gateway excluded)
- ✅ Removed Vercel analytics

### 5. **Supabase Client Updated**
- ✅ Changed from `process.env.NEXT_PUBLIC_*` to `import.meta.env.VITE_*`

---

## 🔄 Required Manual Steps

### Step 1: Update Environment Variables

**Create `.env.local` file:**
```bash
cp .env.local.example .env.local
```

**Update with your values:**
```env
VITE_SUPABASE_URL=https://ligrkhpksdotctcwrxfn.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
VITE_APP_URL=http://localhost:3000
VITE_OPENAI_API_KEY=your_openai_key
```

### Step 2: Convert Next.js Pages to React Components

**Pages to convert** (in `src/app/` → move to `src/pages/`):

#### Auth Pages:
- `src/app/(auth)/login/page.tsx` → `src/pages/auth/login.tsx`
- `src/app/(auth)/signup/page.tsx` → `src/pages/auth/signup.tsx`

#### Marketing Pages:
- `src/app/page.tsx` → `src/pages/landing.tsx`

#### Dashboard Pages:
- `src/app/(dashboard)/dashboard/page.tsx` → `src/pages/dashboard/home.tsx`
- `src/app/(dashboard)/my-resumes/page.tsx` → `src/pages/dashboard/my-resumes.tsx`
- `src/app/(dashboard)/ai-customize/page.tsx` → `src/pages/dashboard/ai-customize.tsx`
- `src/app/(dashboard)/templates/page.tsx` → `src/pages/dashboard/templates.tsx`
- `src/app/(dashboard)/interview-prep/page.tsx` → `src/pages/dashboard/interview-prep.tsx`
- `src/app/(dashboard)/salary-guide/page.tsx` → `src/pages/dashboard/salary-guide.tsx`
- `src/app/(dashboard)/visiting-cards/page.tsx` → `src/pages/dashboard/visiting-cards.tsx`
- `src/app/(dashboard)/settings/page.tsx` → `src/pages/dashboard/settings.tsx`

**Conversion pattern:**
```typescript
// OLD (Next.js page.tsx)
export default function Page() {
  return <div>Content</div>
}

// NEW (React component)
export default function PageName() {
  return <div>Content</div>
}
```

### Step 3: Replace Next.js Specific Imports

**Find and replace across all files:**

| Next.js Import | React/Vite Replacement |
|----------------|------------------------|
| `import { useRouter } from 'next/navigation'` | `import { useNavigate, useLocation } from 'react-router-dom'` |
| `import { usePathname } from 'next/navigation'` | `import { useLocation } from 'react-router-dom'` |
| `import { useSearchParams } from 'next/navigation'` | `import { useSearchParams } from 'react-router-dom'` |
| `import Link from 'next/link'` | `import { Link } from 'react-router-dom'` |
| `import Image from 'next/image'` | `<img>` tag |
| `router.push('/path')` | `navigate('/path')` |
| `pathname` | `location.pathname` |

### Step 4: Update Image Components

**Replace Next.js Image:**
```typescript
// OLD
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// NEW
<img src="/logo.png" alt="Logo" className="w-[100px] h-[100px]" />
```

### Step 5: Remove Server-Side Code

**Delete these folders/files:**
- ❌ `src/app/api/` (all API routes - payment gateway excluded)
- ❌ `src/middleware.ts` (converted to client-side route guards)
- ❌ `src/lib/supabase/server.ts` (server-only Supabase client)

**Files to delete (Razorpay/Payment related):**
- ❌ `src/app/api/razorpay/` (entire folder)
- ❌ `src/components/checkout/` (payment checkout components)
- ❌ `src/components/free-tier-prompt.tsx` (payment prompts)
- ❌ `src/components/upgrade-modal.tsx` (payment modals)
- ❌ `src/lib/razorpay.ts` (Razorpay utilities)
- ❌ `src/lib/pricing-config.ts` (pricing configuration)
- ❌ `RAZORPAY_INTEGRATION_FIXES.md`
- ❌ `CRITICAL_FIX_MANDATE_AUTH.md`
- ❌ `scripts/create-razorpay-plans.ts`

### Step 6: Update Theme Provider

**Create custom theme provider** (replace next-themes):

```typescript
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'system',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
```

### Step 7: Update Sidebar Component

**Replace Next.js Link with React Router Link:**

```typescript
// In src/components/sidebar.tsx
import { Link, useLocation } from 'react-router-dom'

// Replace all <Link href="/path"> with <Link to="/path">
```

### Step 8: Clean Up Next.js Config Files

**Delete these files:**
- ❌ `next.config.mjs`
- ❌ `next-env.d.ts`
- ❌ `.next/` folder (if exists)

### Step 9: Update TypeScript Config

**Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Create `tsconfig.node.json`:**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 🧪 Testing the Migration

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## ⚠️ Breaking Changes

### What No Longer Works:
1. ❌ **Server-side rendering (SSR)** - All rendering is client-side
2. ❌ **API routes** - Need separate backend or use Supabase Edge Functions
3. ❌ **Payment gateway** - All Razorpay integration removed
4. ❌ **Middleware** - Replaced with client-side route guards
5. ❌ **Image optimization** - Use standard `<img>` tags
6. ❌ **File-based routing** - Using React Router instead

### What Still Works:
1. ✅ **Supabase authentication** - Client-side auth
2. ✅ **Supabase database** - All queries work
3. ✅ **UI components** - All shadcn/ui components
4. ✅ **Styling** - TailwindCSS works the same
5. ✅ **AI features** - OpenAI integration (client-side)
6. ✅ **Resume generation** - All resume features
7. ✅ **Visiting cards** - QR code generation

---

## 📦 New File Structure

```
resume-builder/
├── index.html              # Entry HTML
├── vite.config.ts          # Vite configuration
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main app with routing
│   ├── pages/             # All pages (converted from app/)
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── dashboard/
│   │   │   ├── home.tsx
│   │   │   ├── my-resumes.tsx
│   │   │   └── ...
│   │   └── landing.tsx
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── components/        # Existing components
│   ├── lib/              # Utilities
│   └── types/            # TypeScript types
├── public/               # Static assets
└── dist/                 # Build output
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build command
npm run build

# Output directory
dist

# Install command
npm install
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

---

## 📝 Next Steps After Migration

1. ✅ Test all authentication flows
2. ✅ Test resume creation and customization
3. ✅ Test AI features
4. ✅ Verify Supabase connections
5. ✅ Check all routes and navigation
6. ✅ Test responsive design
7. ✅ Verify dark mode functionality
8. ✅ Deploy to staging environment
9. ✅ Run full QA testing
10. ✅ Deploy to production

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module '@/...'"
**Solution:** Check `vite.config.ts` has correct alias configuration

### Issue: "process is not defined"
**Solution:** Replace `process.env.NEXT_PUBLIC_*` with `import.meta.env.VITE_*`

### Issue: "useRouter is not a function"
**Solution:** Replace Next.js `useRouter` with React Router's `useNavigate`

### Issue: Images not loading
**Solution:** Ensure images are in `public/` folder and use `/image.png` paths

### Issue: Styles not applying
**Solution:** Check `globals.css` is imported in `main.tsx`

---

## ✅ Migration Checklist

- [ ] Environment variables configured
- [ ] All pages converted to React components
- [ ] Next.js imports replaced with React Router
- [ ] Images updated to standard `<img>` tags
- [ ] Server-side code removed
- [ ] Payment gateway code removed
- [ ] Theme provider created
- [ ] Sidebar updated with React Router
- [ ] TypeScript config updated
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Production build successful
- [ ] All routes working
- [ ] Authentication working
- [ ] Database queries working
- [ ] Deployed to staging
- [ ] QA testing complete
- [ ] Production deployment

---

**Migration Status:** 🟡 Setup Complete - Manual conversion required  
**Estimated Time:** 4-6 hours for full conversion  
**Risk Level:** Medium - Thorough testing required
