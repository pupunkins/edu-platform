'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <div>
      <h1 style={{ color: 'var(--brown-900)', letterSpacing: '0.12em' }}
        className="text-2xl font-light uppercase text-center mb-10">
        Войти
      </h1>

      <form action={formAction} className="space-y-5">
        <div>
          <label style={{ color: 'var(--brown-600)', letterSpacing: '0.12em' }}
            className="block text-xs uppercase mb-2">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{
              border: '1px solid var(--brown-200)',
              backgroundColor: 'transparent',
              color: 'var(--brown-900)',
            }}
            className="w-full px-4 py-3 text-sm outline-none focus:border-[var(--brown-400)] transition-colors"
          />
        </div>

        <div>
          <label style={{ color: 'var(--brown-600)', letterSpacing: '0.12em' }}
            className="block text-xs uppercase mb-2">
            Пароль
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{
              border: '1px solid var(--brown-200)',
              backgroundColor: 'transparent',
              color: 'var(--brown-900)',
            }}
            className="w-full px-4 py-3 text-sm outline-none focus:border-[var(--brown-400)] transition-colors"
          />
        </div>

        {state?.error && (
          <p className="text-xs text-center" style={{ color: '#B04040' }}>{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            backgroundColor: 'var(--brown-800)',
            color: 'var(--cream)',
            letterSpacing: '0.15em',
          }}
          className="w-full py-3.5 text-xs uppercase font-medium hover:opacity-80 disabled:opacity-40 transition-opacity mt-2"
        >
          {pending ? '...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
