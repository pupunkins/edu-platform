import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Мои курсы</h1>
      <p className="text-sm text-gray-500">{user?.email}</p>
    </div>
  )
}
