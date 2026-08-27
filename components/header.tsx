import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function Header() {
  return (
    <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold text-sm">edu-platform</Link>
        <nav className="flex gap-4 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-black">Мои курсы</Link>
          <Link href="/admin" className="hover:text-black">Админ</Link>
          <Link href="/admin/students" className="hover:text-black">Ученики</Link>
        </nav>
      </div>
      <form action={logout}>
        <button type="submit" className="text-sm text-gray-500 hover:text-black transition-colors">
          Выйти
        </button>
      </form>
    </header>
  )
}
