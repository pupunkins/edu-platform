'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions/auth'

// Страница не линкуется нигде публично — доступна только по прямому URL /register
export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null)

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-xl font-semibold mb-2">Регистрация</h1>
      <p className="text-sm text-gray-500 mb-6">Доступ выдаётся администратором</p>

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
            minLength={8}
            autoComplete="new-password"
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
          {pending ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
