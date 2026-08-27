import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { youtubeEmbedUrl } from '@/lib/youtube'

export default async function LessonPage({
  params,
}: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params
  const supabase = await createServerClient()

  const { data: lesson } = await supabase
    .from('lessons').select('id, module_id, title, description, video_id, duration_seconds')
    .eq('id', lessonId).single()
  if (!lesson) notFound()

  const { data: course } = await supabase
    .from('courses').select('id, title').eq('id', courseId).single()

  const { data: allLessons } = await supabase
    .from('lessons').select('id, title, module_id')
    .in('module_id',
      (await supabase.from('modules').select('id').eq('course_id', courseId).eq('is_published', true))
        .data?.map((m) => m.id) ?? [])
    .eq('is_published', true).order('created_at')

  const idx = allLessons?.findIndex((l) => l.id === lessonId) ?? -1
  const prevLesson = idx > 0 ? allLessons?.[idx - 1] : null
  const nextLesson = allLessons && idx < allLessons.length - 1 ? allLessons[idx + 1] : null

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-3 mb-12"
        style={{ color: 'var(--brown-400)', letterSpacing: '0.1em' }}>
        <Link href="/dashboard" className="text-xs uppercase hover:opacity-70 transition-opacity">Курсы</Link>
        <span className="text-xs">·</span>
        <Link href={`/courses/${courseId}`} className="text-xs uppercase hover:opacity-70 transition-opacity">
          {course?.title}
        </Link>
      </div>

      <h1 style={{ color: 'var(--brown-900)', letterSpacing: '0.08em' }}
        className="text-2xl font-light uppercase mb-8">
        {lesson.title}
      </h1>

      {/* Плеер */}
      {lesson.video_id ? (
        <div className="relative w-full mb-10" style={{ paddingTop: '56.25%', backgroundColor: 'var(--brown-900)' }}>
          <iframe
            src={youtubeEmbedUrl(lesson.video_id)}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="relative w-full mb-10 flex items-center justify-center"
          style={{ paddingTop: '56.25%', backgroundColor: 'var(--brown-100)' }}>
          <span className="absolute text-xs uppercase" style={{ color: 'var(--brown-400)', letterSpacing: '0.1em' }}>Видео скоро появится</span>
        </div>
      )}

      {/* Описание */}
      {lesson.description && (
        <div className="mb-12 pb-12" style={{ borderBottom: '1px solid var(--brown-200)' }}>
          <p style={{ color: 'var(--brown-600)' }} className="text-sm leading-relaxed">
            {lesson.description}
          </p>
        </div>
      )}

      {/* Навигация */}
      <div className="flex justify-between items-center pt-4">
        {prevLesson ? (
          <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}
            style={{ color: 'var(--brown-400)', letterSpacing: '0.08em' }}
            className="text-xs uppercase hover:opacity-70 transition-opacity">
            ← {prevLesson.title}
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`}
            style={{ color: 'var(--brown-400)', letterSpacing: '0.08em' }}
            className="text-xs uppercase hover:opacity-70 transition-opacity">
            ← К курсу
          </Link>
        )}
        {nextLesson && (
          <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}
            style={{ color: 'var(--brown-800)', letterSpacing: '0.08em' }}
            className="text-xs uppercase font-medium hover:opacity-70 transition-opacity">
            {nextLesson.title} →
          </Link>
        )}
      </div>
    </div>
  )
}
