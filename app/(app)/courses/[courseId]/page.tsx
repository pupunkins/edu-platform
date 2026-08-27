import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import BuyButton from '@/components/buy-button'

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: course } = await supabase
    .from('courses').select('id, title, description, price_cents').eq('id', courseId).single()
  if (!course) notFound()

  // Проверяем есть ли у ученика доступ
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, access_until')
    .eq('user_id', user!.id)
    .eq('course_id', courseId)
    .maybeSingle()

  const hasAccess = !!enrollment && (
    !enrollment.access_until || new Date(enrollment.access_until) > new Date()
  )
  const isPaid = course.price_cents > 0

  const { data: modules } = await supabase
    .from('modules').select('id, title, order_index, is_published')
    .eq('course_id', courseId).eq('is_published', true).order('order_index')

  const moduleIds = modules?.map((m) => m.id) ?? []
  const { data: lessons } = moduleIds.length
    ? await supabase.from('lessons')
        .select('id, module_id, title, duration_seconds, is_published')
        .in('module_id', moduleIds).eq('is_published', true).order('created_at')
    : { data: [] }

  type Lesson = NonNullable<typeof lessons>[number]
  const lessonsByModule = (lessons ?? []).reduce<Record<string, Lesson[]>>((acc, l) => {
    if (!l) return acc
    acc[l.module_id] = acc[l.module_id] ?? []
    acc[l.module_id]!.push(l)
    return acc
  }, {})

  const firstLesson = lessons?.[0]

  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <Link href="/dashboard"
        style={{ color: 'var(--brown-400)', letterSpacing: '0.1em' }}
        className="text-xs uppercase hover:opacity-70 transition-opacity">
        ← Все курсы
      </Link>

      <div className="mt-10 mb-14">
        <p style={{ color: 'var(--brown-400)', letterSpacing: '0.2em' }}
          className="text-xs uppercase mb-3">Курс</p>
        <h1 style={{ color: 'var(--brown-900)', letterSpacing: '0.08em' }}
          className="text-3xl font-light uppercase">
          {course.title}
        </h1>
        {course.description && (
          <p style={{ color: 'var(--brown-600)' }} className="mt-4 text-sm leading-relaxed">
            {course.description}
          </p>
        )}
        <div className="mt-8">
          {isPaid && !hasAccess ? (
            <BuyButton courseId={courseId} priceUsd={course.price_cents / 100} />
          ) : firstLesson ? (
            <Link href={`/courses/${courseId}/lessons/${firstLesson.id}`}
              style={{ backgroundColor: 'var(--brown-800)', color: 'var(--cream)', letterSpacing: '0.15em' }}
              className="inline-block px-8 py-3.5 text-xs uppercase hover:opacity-80 transition-opacity">
              Начать курс →
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-px" style={{ backgroundColor: 'var(--brown-200)' }}>
        {modules?.map((mod, mi) => (
          <div key={mod.id} style={{ backgroundColor: 'var(--cream)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--brown-100)' }}>
              <p style={{ color: 'var(--brown-400)', letterSpacing: '0.12em' }}
                className="text-xs uppercase">
                Модуль {mi + 1} — {mod.title}
              </p>
            </div>
            {(lessonsByModule[mod.id] ?? []).map((lesson, li) => (
              lesson && (
                <Link key={lesson.id}
                  href={`/courses/${courseId}/lessons/${lesson.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[var(--brown-50)] transition-colors group"
                  style={{ borderBottom: '1px solid var(--brown-100)' }}>
                  <div className="flex items-center gap-4">
                    <span style={{ color: 'var(--brown-300)' }} className="text-xs w-5">{li + 1}</span>
                    <span style={{ color: 'var(--brown-800)' }} className="text-sm group-hover:opacity-70 transition-opacity">
                      {lesson.title}
                    </span>
                  </div>
                  {lesson.duration_seconds > 0 && (
                    <span style={{ color: 'var(--brown-400)' }} className="text-xs">
                      {formatDuration(lesson.duration_seconds)}
                    </span>
                  )}
                </Link>
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}
