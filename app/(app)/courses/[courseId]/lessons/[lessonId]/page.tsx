import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { youtubeEmbedUrl } from '@/lib/youtube'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createServerClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, module_id, title, description, video_id, duration_seconds')
    .eq('id', lessonId)
    .single()

  if (!lesson) notFound()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .single()

  // Все уроки курса для навигации prev/next
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, module_id')
    .in(
      'module_id',
      (
        await supabase
          .from('modules')
          .select('id')
          .eq('course_id', courseId)
          .eq('is_published', true)
      ).data?.map((m) => m.id) ?? []
    )
    .eq('is_published', true)
    .order('created_at')

  const currentIdx = allLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const prevLesson = currentIdx > 0 ? allLessons?.[currentIdx - 1] : null
  const nextLesson = allLessons && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:underline">Курсы</Link>
        <span>/</span>
        <Link href={`/courses/${courseId}`} className="hover:underline">{course?.title}</Link>
        <span>/</span>
        <span className="text-gray-900">{lesson.title}</span>
      </div>

      <h1 className="text-xl font-semibold">{lesson.title}</h1>

      {/* YouTube плеер */}
      {lesson.video_id ? (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={youtubeEmbedUrl(lesson.video_id)}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm" style={{ paddingTop: '56.25%', position: 'relative' }}>
          <span className="absolute">Видео скоро появится</span>
        </div>
      )}

      {/* Описание */}
      {lesson.description && (
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{lesson.description}</p>
        </div>
      )}

      {/* Навигация prev/next */}
      <div className="flex justify-between pt-4 border-t">
        {prevLesson ? (
          <Link
            href={`/courses/${courseId}/lessons/${prevLesson.id}`}
            className="text-sm text-gray-600 hover:text-black"
          >
            ← {prevLesson.title}
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`} className="text-sm text-gray-600 hover:text-black">
            ← К курсу
          </Link>
        )}
        {nextLesson && (
          <Link
            href={`/courses/${courseId}/lessons/${nextLesson.id}`}
            className="text-sm font-medium text-black hover:underline"
          >
            {nextLesson.title} →
          </Link>
        )}
      </div>
    </div>
  )
}
