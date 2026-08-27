'use client'

import { useTransition } from 'react'

interface Props {
  action: (formData: FormData) => Promise<void>
  fields: Record<string, string>
  label?: string
  confirm?: string
}

export default function DeleteButton({ action, fields, label = 'Удалить', confirm: confirmText = 'Удалить?' }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmText)) return
    const formData = new FormData()
    Object.entries(fields).forEach(([k, v]) => formData.set(k, v))
    startTransition(() => action(formData))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-red-500 hover:underline text-sm disabled:opacity-40"
    >
      {pending ? '...' : label}
    </button>
  )
}
