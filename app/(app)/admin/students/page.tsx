import { createAdminClient } from '@/lib/supabase/admin'
import { createStudent, deleteStudent, blockStudent, unblockStudent } from '@/app/actions/students'
import DeleteButton from '@/components/delete-button'
import StudentForm from './student-form'

export default async function StudentsPage() {
  const supabase = createAdminClient()

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const { data: profiles } = await supabase.from('profiles').select('id, name, status, tariff')

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const students = users
    .filter((u) => u.email)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Ученики</h1>

      {/* Список */}
      <div className="space-y-2">
        {students.length === 0 && (
          <p className="text-gray-500 text-sm">Учеников пока нет</p>
        )}
        {students.map((user) => {
          const profile = profileMap[user.id]
          const isBlocked = profile?.status === 'blocked' || !!user.banned_until
          return (
            <div key={user.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                {profile?.name && (
                  <p className="font-medium text-sm">{profile.name}</p>
                )}
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {isBlocked ? 'заблокирован' : 'активен'}
                  </span>
                  {profile?.tariff && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {profile.tariff}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <form action={isBlocked ? unblockStudent : blockStudent}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" className="text-xs text-gray-500 hover:text-black">
                    {isBlocked ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                </form>
                <DeleteButton
                  action={deleteStudent}
                  fields={{ userId: user.id }}
                  confirm={`Удалить аккаунт ${user.email}? Это действие необратимо.`}
                  label="Удалить"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Форма создания */}
      <StudentForm action={createStudent} />
    </div>
  )
}
