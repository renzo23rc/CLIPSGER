import { createMatch } from '@/app/admin/actions'
import Link from 'next/link'

export default function NewMatchPage() {
  return (
    <div className="py-6 max-w-lg">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Panel</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">Nuevo Partido</h1>
      <form action={createMatch} className="space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Título</span>
          <input name="title" className="p-2 border rounded" placeholder="GER vs Rival — Fecha" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Video URL/ID</span>
          <input name="video_url" className="p-2 border rounded" placeholder="YouTube ID o URL MP4" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Tipo de Video</span>
          <select name="video_type" className="p-2 border rounded" required>
            <option value="youtube">YouTube</option>
            <option value="mp4">MP4 (link directo)</option>
          </select>
        </label>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Crear Partido</button>
      </form>
    </div>
  )
}
