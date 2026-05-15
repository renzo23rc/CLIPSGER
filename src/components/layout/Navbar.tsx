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
