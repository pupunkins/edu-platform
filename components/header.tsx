import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function Header() {
  return (
    <header style={{ borderBottom: '1px solid var(--brown-200)', backgroundColor: 'var(--cream)' }}
      className="px-8 py-5 flex items-center justify-between">
      <Link href="/dashboard"
        style={{ color: 'var(--brown-900)', letterSpacing: '0.15em' }}
        className="text-xs font-medium uppercase">
        EDU PLATFORM
      </Link>

      <nav className="flex items-center gap-8">
        <Link href="/dashboard"
          style={{ color: 'var(--brown-600)', letterSpacing: '0.1em' }}
          className="text-xs uppercase hover:opacity-70 transition-opacity">
          Курсы
        </Link>
        <Link href="/admin"
          style={{ color: 'var(--brown-600)', letterSpacing: '0.1em' }}
          className="text-xs uppercase hover:opacity-70 transition-opacity">
          Админ
        </Link>
        <Link href="/admin/students"
          style={{ color: 'var(--brown-600)', letterSpacing: '0.1em' }}
          className="text-xs uppercase hover:opacity-70 transition-opacity">
          Ученики
        </Link>
      </nav>

      <form action={logout}>
        <button type="submit"
          style={{ color: 'var(--brown-400)', letterSpacing: '0.1em' }}
          className="text-xs uppercase hover:opacity-70 transition-opacity">
          Выйти
        </button>
      </form>
    </header>
  )
}
