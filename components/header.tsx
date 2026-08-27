import { logout } from '@/app/actions/auth'

export default function Header() {
  return (
    <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
      <span className="font-semibold text-sm">edu-platform</span>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-gray-500 hover:text-black transition-colors"
        >
          Выйти
        </button>
      </form>
    </header>
  )
}
