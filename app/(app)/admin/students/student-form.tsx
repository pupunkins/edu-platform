'use client'

import { useActionState } from 'react'
import { useRef } from 'react'

type State = { error?: string; success?: string } | null

export default function StudentForm({
  action,
}: {
  action: (prev: State, formData: FormData) => Promise<State>
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Сбрасываем форму после успеха
  if (state?.success && formRef.current) {
    formRef.current.reset()
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h2 className="font-semibold">Добавить ученика</h2>
      <form ref={formRef} action={formAction} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Имя</label>
          <input
            name="name"
            placeholder="Например: Анна Смирнова"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            name="email"
            type="email"
            required
            placeholder="anna@example.com"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Пароль *</label>
          <input
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="Минимум 8 символов"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Запишите пароль — он показывается только здесь</p>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-600">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          {pending ? 'Создаём...' : 'Создать аккаунт'}
        </button>
      </form>
    </div>
  )
}
