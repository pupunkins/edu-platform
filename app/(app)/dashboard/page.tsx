import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      modules(
        id,
        is_published,
        lessons(id, is_published)
      )
    `)
    .order('title')

  const withStats = (courses ?? []).map((c) => {
    const publishedModules = c.modules?.filter((m) => m.is_published) ?? []
    const totalLessons = publishedModules.reduce(
      (sum, m) => sum + (m.lessons?.filter((l) => l.is_published).length ?? 0), 0
    )
    return { ...c, moduleCount: publishedModules.length, lessonCount: totalLessons }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Мои курсы</h1>

      {withStats.length === 0 && (
        <p className="text-gray-500 text-sm">Курсов пока нет</p>
      )}

      <div className="grid gap-4">
        {withStats.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block border rounded-xl p-5 hover:border-gray-400 transition-colors"
          >
            <h2 className="font-semibold text-lg">{course.title}</h2>
            {course.description && (
              <p className="text-gray-600 text-sm mt-1">{course.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">
              {course.moduleCount} {plural(course.moduleCount, 'модуль', 'модуля', 'модулей')} · {course.lessonCount} {plural(course.lessonCount, 'урок', 'урока', 'уроков')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
