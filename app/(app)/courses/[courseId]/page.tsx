import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createServerClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, description')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select('id, title, order_index, is_published')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('order_index')

  const moduleIds = modules?.map((m) => m.id) ?? []

  const { data: lessons } = moduleIds.length
    ? await supabase
        .from('lessons')
        .select('id, module_id, title, description, video_id, duration_seconds, is_published')
        .in('module_id', moduleIds)
        .eq('is_published', true)
        .order('created_at')
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">← Все курсы</Link>
        <h1 className="text-2xl font-semibold mt-2">{course.title}</h1>
        {course.description && (
          <p className="text-gray-600 mt-1">{course.description}</p>
        )}
        {firstLesson && (
          <Link
            href={`/courses/${courseId}/lessons/${firstLesson.id}`}
            className="inline-block mt-4 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Начать курс →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {modules?.map((mod, mi) => (
          <div key={mod.id} className="border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3">
              <span className="text-xs text-gray-400 font-mono mr-2">Модуль {mi + 1}</span>
              <span className="font-medium">{mod.title}</span>
            </div>
            <div className="divide-y">
              {(lessonsByModule[mod.id] ?? []).map((lesson, li) => (
                lesson && (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 text-right">{li + 1}</span>
                      <span className="text-sm">{lesson.title}</span>
                    </div>
                    {lesson.duration_seconds > 0 && (
                      <span className="text-xs text-gray-400">{formatDuration(lesson.duration_seconds)}</span>
                    )}
                  </Link>
                )
              ))}
              {(lessonsByModule[mod.id] ?? []).length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400">Уроки скоро появятся</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
