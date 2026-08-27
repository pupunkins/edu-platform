import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { grantAccess, revokeAccess, updateAccessUntil } from '@/app/actions/enrollments'
import DeleteButton from '@/components/delete-button'

export default async function StudentPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const admin = createAdminClient()
  const supabase = await createServerClient()

  const { data: { user }, error } = await admin.auth.admin.getUserById(userId)
  if (error || !user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, tariff, status')
    .eq('id', userId)
    .single()

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('id, course_id, granted_at, access_until, courses(title)')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })

  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  const enrolledCourseIds = new Set((enrollments ?? []).map((e) => e.course_id))
  const availableCourses = (allCourses ?? []).filter((c) => !enrolledCourseIds.has(c.id))

  function formatDate(iso: string | null) {
    if (!iso) return 'Бессрочно'
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function toInputDate(iso: string | null) {
    if (!iso) return ''
    return iso.slice(0, 10)
  }

  const isExpired = (access_until: string | null) => {
    if (!access_until) return false
    return new Date(access_until) < new Date()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">Ученики</Link>
        <span>/</span>
        <span className="text-gray-900">{profile?.name || user.email}</span>
      </div>

      {/* Инфо об ученике */}
      <div className="border rounded-xl p-5 space-y-1">
        {profile?.name && <p className="font-semibold">{profile.name}</p>}
        <p className="text-sm text-gray-600">{user.email}</p>
        <div className="flex gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${profile?.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            {profile?.status === 'blocked' ? 'заблокирован' : 'активен'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {profile?.tariff ?? 'basic'}
          </span>
        </div>
      </div>

      {/* Доступы к курсам */}
      <div className="space-y-4">
        <h2 className="font-semibold">Доступ к курсам</h2>

        {(enrollments ?? []).length === 0 && (
          <p className="text-sm text-gray-500">Доступов нет</p>
        )}

        {(enrollments ?? []).map((e) => {
          const expired = isExpired(e.access_until)
          return (
            <div key={e.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{Array.isArray(e.courses) ? e.courses[0]?.title : (e.courses as { title: string } | null)?.title}</p>
                  <p className={`text-xs mt-0.5 ${expired ? 'text-red-500' : 'text-gray-500'}`}>
                    {expired ? '⚠ Доступ истёк · ' : ''}{formatDate(e.access_until)}
                  </p>
                </div>
                <DeleteButton
                  action={revokeAccess}
                  fields={{ id: e.id, user_id: userId }}
                  confirm="Закрыть доступ к этому курсу?"
                  label="Закрыть доступ"
                />
              </div>

              {/* Изменить дату */}
              <form action={updateAccessUntil} className="flex items-center gap-2">
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="user_id" value={userId} />
                <input
                  name="access_until"
                  type="date"
                  defaultValue={toInputDate(e.access_until)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <button type="submit" className="text-sm text-blue-600 hover:underline">
                  Сохранить дату
                </button>
                <span className="text-xs text-gray-400">(пусто = бессрочно)</span>
              </form>
            </div>
          )
        })}
      </div>

      {/* Выдать доступ */}
      {availableCourses.length > 0 && (
        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-medium">Выдать доступ к курсу</h3>
          <form action={grantAccess} className="space-y-3">
            <input type="hidden" name="user_id" value={userId} />
            <div>
              <label className="block text-sm font-medium mb-1">Курс</label>
              <select name="course_id" required className="w-full border rounded-lg px-3 py-2 text-sm">
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Доступ до</label>
              <input
                name="access_until"
                type="date"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Оставь пустым — доступ бессрочный</p>
            </div>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
            >
              Выдать доступ
            </button>
          </form>
        </div>
      )}

      {availableCourses.length === 0 && (enrollments ?? []).length > 0 && (
        <p className="text-sm text-gray-400">Ученик уже имеет доступ ко всем курсам</p>
      )}
    </div>
  )
}
