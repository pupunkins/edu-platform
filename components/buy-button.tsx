'use client'

import { useState } from 'react'

export default function BuyButton({ courseId, priceUsd }: { courseId: string; priceUsd: number }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ backgroundColor: 'var(--brown-800)', color: 'var(--cream)', letterSpacing: '0.15em' }}
      className="inline-block px-8 py-3.5 text-xs uppercase font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
    >
      {loading ? '...' : `Купить — $${priceUsd}`}
    </button>
  )
}
