'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-xl font-semibold mb-6">Войти в платформу</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
