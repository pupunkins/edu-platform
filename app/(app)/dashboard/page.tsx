import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`id, title, description, modules(id, is_published, lessons(id, is_published))`)
    .order('title')

  const withStats = (courses ?? []).map((c) => {
    const publishedModules = c.modules?.filter((m) => m.is_published) ?? []
    const totalLessons = publishedModules.reduce(
      (sum, m) => sum + (m.lessons?.filter((l) => l.is_published).length ?? 0), 0
    )
    return { ...c, moduleCount: publishedModules.length, lessonCount: totalLessons }
  })

  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="mb-14">
        <p style={{ color: 'var(--brown-400)', letterSpacing: '0.2em' }}
          className="text-xs uppercase mb-3">
          Платформа
        </p>
        <h1 style={{ color: 'var(--brown-900)', letterSpacing: '0.08em' }}
          className="text-4xl font-light uppercase">
          Мои курсы
        </h1>
      </div>

      {withStats.length === 0 && (
        <p style={{ color: 'var(--brown-400)' }} className="text-sm">Курсов пока нет</p>
      )}

      <div className="grid gap-px" style={{ backgroundColor: 'var(--brown-200)' }}>
        {withStats.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}
            className="block group"
            style={{ backgroundColor: 'var(--cream)' }}>
            <div className="px-8 py-8 flex items-center justify-between hover:bg-[var(--brown-50)] transition-colors">
              <div>
                <h2 style={{ color: 'var(--brown-900)', letterSpacing: '0.06em' }}
                  className="text-lg uppercase font-light group-hover:opacity-70 transition-opacity">
                  {course.title}
                </h2>
                {course.description && (
                  <p style={{ color: 'var(--brown-400)' }} className="text-sm mt-1.5">
                    {course.description}
                  </p>
                )}
                <p style={{ color: 'var(--brown-400)', letterSpacing: '0.08em' }}
                  className="text-xs uppercase mt-3">
                  {course.moduleCount} {plural(course.moduleCount, 'модуль', 'модуля', 'модулей')}
                  &ensp;·&ensp;
                  {course.lessonCount} {plural(course.lessonCount, 'урок', 'урока', 'уроков')}
                </p>
              </div>
              <span style={{ color: 'var(--brown-300)' }} className="text-xl font-light">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10, mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}
