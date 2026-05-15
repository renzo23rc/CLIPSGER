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
