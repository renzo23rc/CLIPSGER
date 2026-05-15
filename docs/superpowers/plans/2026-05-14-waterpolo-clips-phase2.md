# GER Waterpolo - Fase 2: Supabase Auth y Vista Pública (Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar autenticación para editores con Supabase Auth (Magic Link), proteger la ruta `/admin` mediante Middleware de Next.js, y crear la Home pública que lista los partidos desde la DB.

**Architecture:** Next.js App Router. Middleware per-request para proteger `/admin`. Componentes de servidor para fetch de partidos (Server Components). Client Components para el form de login.

**Tech Stack:** Next.js 15, React 19, Supabase SSR, Tailwind CSS.

---

### Task 1: Configurar Supabase Server Client y Middleware

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Escribir Supabase Server Client**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se ignora en Server Components puros
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Escribir Helper de Middleware**
```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 3: Implementar Middleware**
```typescript
// src/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4: Commit**
```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: setup supabase server client y middleware de auth"
```

### Task 2: Página de Login (Magic Link)

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`

- [ ] **Step 1: Escribir Server Actions para Login**
```typescript
// src/app/login/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

- [ ] **Step 2: Escribir Página de Login**
```tsx
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { loginWithEmail } from './actions'

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit(formData: FormData) {
    setStatus('loading')
    const res = await loginWithEmail(formData)
    if (res?.error) {
      setStatus('error')
      setErrorMessage(res.error)
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Acceso Editor</h1>
        {status === 'success' ? (
          <div className="p-4 bg-green-50 text-green-700 rounded text-center">
            Revisá tu correo. Te enviamos un link mágico para entrar.
          </div>
        ) : (
          <form action={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span>Email</span>
              <input 
                name="email" 
                type="email" 
                required 
                className="p-2 border rounded"
                placeholder="editor@clubger.com.ar"
              />
            </label>
            {status === 'error' && (
              <div className="text-red-600 text-sm">{errorMessage}</div>
            )}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Link Mágico'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/login/
git commit -m "feat: crear pagina de login con magic link"
```

### Task 3: Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Escribir route handler**
```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  // Devolver al login si falla
  return NextResponse.redirect(`${origin}/login?error=InvalidToken`)
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/auth/
git commit -m "feat: agregar auth callback route"
```

### Task 4: Layout y Navbar Públicos

**Files:**
- Modify: `src/app/layout.tsx` (reemplazar)
- Create: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Crear Navbar**
```tsx
// src/components/layout/Navbar.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-blue-800">
          GER Waterpolo
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-sm font-medium hover:text-blue-600">Partidos</Link>
          {user ? (
            <Link href="/admin" className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded">
              Panel Editor
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Actualizar Layout Global**
```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'GER Waterpolo Clips',
  description: 'Análisis de partidos de Waterpolo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/layout.tsx src/components/layout/
git commit -m "feat: agregar navbar con estado de usuario"
```

### Task 5: Home Pública (Lista de Partidos)

**Files:**
- Modify: `src/app/page.tsx` (reemplazar)

- [ ] **Step 1: Actualizar Page**
```tsx
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Fuerza renderizado dinámico en Home para ver los últimos
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Últimos Partidos</h1>
      
      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded">
          Error al cargar los partidos.
        </div>
      ) : matches?.length === 0 ? (
        <div className="text-gray-500">
          Aún no hay partidos cargados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches?.map(match => (
            <Link 
              key={match.id} 
              href={`/partidos/${match.id}`}
              className="block bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h2 className="font-semibold text-lg line-clamp-2 mb-2">{match.title}</h2>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {match.video_type}
                </span>
                <span>{new Date(match.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat: listar partidos en la home page"
```