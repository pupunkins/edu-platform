import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import {
  createModule, deleteModule, updateModule,
  createLesson, deleteLesson, updateLesson,
  updateCourse,
} from '@/app/actions/courses'

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
    .order('order_index')

  const moduleIds = modules?.map((m) => m.id) ?? []

  const { data: lessons } = moduleIds.length
    ? await supabase
        .from('lessons')
        .select('id, module_id, title, description, video_id, duration_seconds, is_published')
        .in('module_id', moduleIds)
        .order('created_at')
    : { data: [] }

  type Lesson = NonNullable<typeof lessons>[number]
  const lessonsByModule = (lessons ?? []).reduce<Record<string, Lesson[]>>((acc, lesson) => {
    if (!lesson) return acc
    acc[lesson.module_id] = acc[lesson.module_id] ?? []
    acc[lesson.module_id]!.push(lesson)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:underline">Курсы</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{course.title}</span>
      </div>

      {/* Редактировать курс */}
      <details className="border rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600">Редактировать курс</summary>
        <form action={updateCourse} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={course.id} />
          <input
            name="title"
            defaultValue={course.title}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            defaultValue={course.description ?? ''}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm">
            Сохранить
          </button>
        </form>
      </details>

      {/* Модули */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Модули</h2>

        {modules?.length === 0 && (
          <p className="text-gray-500 text-sm">Модулей пока нет</p>
        )}

        {modules?.map((mod) => (
          <div key={mod.id} className="border rounded-xl overflow-hidden">
            {/* Шапка модуля */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">#{mod.order_index + 1}</span>
                <span className="font-medium">{mod.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${mod.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {mod.is_published ? 'опубликован' : 'черновик'}
                </span>
              </div>
              <div className="flex gap-3 text-sm">
                <form action={updateModule}>
                  <input type="hidden" name="id" value={mod.id} />
                  <input type="hidden" name="course_id" value={courseId} />
                  <input type="hidden" name="title" value={mod.title} />
                  <input type="hidden" name="is_published" value={(!mod.is_published).toString()} />
                  <button type="submit" className="text-blue-600 hover:underline text-xs">
                    {mod.is_published ? 'Скрыть' : 'Опубликовать'}
                  </button>
                </form>
                <form action={deleteModule}>
                  <input type="hidden" name="id" value={mod.id} />
                  <input type="hidden" name="course_id" value={courseId} />
                  <button type="submit" className="text-red-500 hover:underline text-xs">
                    Удалить
                  </button>
                </form>
              </div>
            </div>

            {/* Уроки модуля */}
            <div className="divide-y">
              {(lessonsByModule[mod.id] ?? []).map((lesson) => (
                lesson && (
                  <details key={lesson.id} className="px-4 py-3">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.video_id && (
                          <span className="text-xs text-gray-400">▶ {lesson.video_id}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {lesson.is_published ? 'опубликован' : 'черновик'}
                        </span>
                      </div>
                    </summary>
                    <form action={updateLesson} className="mt-3 space-y-2">
                      <input type="hidden" name="id" value={lesson.id} />
                      <input type="hidden" name="course_id" value={courseId} />
                      <input type="hidden" name="module_id" value={mod.id} />
                      <input name="title" defaultValue={lesson.title} placeholder="Название урока" required className="w-full border rounded px-3 py-1.5 text-sm" />
                      <textarea name="description" defaultValue={lesson.description ?? ''} rows={2} placeholder="Описание" className="w-full border rounded px-3 py-1.5 text-sm resize-none" />
                      <div className="flex gap-2">
                        <input name="video_id" defaultValue={lesson.video_id ?? ''} placeholder="ID видео (Bunny/Mux)" className="flex-1 border rounded px-3 py-1.5 text-sm" />
                        <input name="duration_seconds" defaultValue={lesson.duration_seconds ?? 0} type="number" placeholder="Сек." className="w-24 border rounded px-3 py-1.5 text-sm" />
                      </div>
                      <div className="flex items-center gap-3">
                        <select name="is_published" defaultValue={lesson.is_published.toString()} className="border rounded px-2 py-1.5 text-sm">
                          <option value="false">Черновик</option>
                          <option value="true">Опубликован</option>
                        </select>
                        <button type="submit" className="bg-black text-white px-3 py-1.5 rounded text-sm">
                          Сохранить
                        </button>
                        <form action={deleteLesson}>
                          <input type="hidden" name="id" value={lesson.id} />
                          <input type="hidden" name="course_id" value={courseId} />
                          <button type="submit" className="text-red-500 text-sm hover:underline">
                            Удалить
                          </button>
                        </form>
                      </div>
                    </form>
                  </details>
                )
              ))}

              {/* Добавить урок */}
              <details className="px-4 py-3 bg-gray-50/50">
                <summary className="cursor-pointer text-sm text-blue-600 hover:underline">+ Добавить урок</summary>
                <form action={createLesson} className="mt-3 space-y-2">
                  <input type="hidden" name="module_id" value={mod.id} />
                  <input type="hidden" name="course_id" value={courseId} />
                  <input name="title" required placeholder="Название урока *" className="w-full border rounded px-3 py-1.5 text-sm" />
                  <textarea name="description" rows={2} placeholder="Описание (опционально)" className="w-full border rounded px-3 py-1.5 text-sm resize-none" />
                  <div className="flex gap-2">
                    <input name="video_id" placeholder="ID видео (Bunny/Mux)" className="flex-1 border rounded px-3 py-1.5 text-sm" />
                    <input name="duration_seconds" type="number" placeholder="Сек." className="w-24 border rounded px-3 py-1.5 text-sm" />
                  </div>
                  <button type="submit" className="bg-black text-white px-4 py-1.5 rounded text-sm">
                    Добавить урок
                  </button>
                </form>
              </details>
            </div>
          </div>
        ))}
      </div>

      {/* Добавить модуль */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm">Добавить модуль</h3>
        <form action={createModule} className="flex gap-2">
          <input type="hidden" name="course_id" value={courseId} />
          <input
            name="title"
            required
            placeholder="Название модуля"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
            Добавить
          </button>
        </form>
      </div>
    </div>
  )
}
