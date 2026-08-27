import { createServerClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Панель администратора</h1>
      <p className="text-sm text-gray-500">{user?.email}</p>
    </div>
  )
}
