import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { createCourse, deleteCourse } from '@/app/actions/courses'
import DeleteButton from '@/components/delete-button'

export default async function AdminPage() {
  const supabase = await createServerClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description')
    .order('title')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Курсы</h1>

      {/* Список курсов */}
      <div className="space-y-2">
        {courses?.length === 0 && (
          <p className="text-gray-500 text-sm">Курсов пока нет</p>
        )}
        {courses?.map((course) => (
          <div key={course.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
            <div>
              <Link
                href={`/admin/courses/${course.id}`}
                className="font-medium hover:underline"
              >
                {course.title}
              </Link>
              {course.description && (
                <p className="text-sm text-gray-500 mt-0.5">{course.description}</p>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:underline">
                Открыть
              </Link>
              <DeleteButton
                action={deleteCourse}
                fields={{ id: course.id }}
                confirm="Удалить курс со всеми модулями и уроками?"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Форма нового курса */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Добавить курс</h2>
        <form action={createCourse} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input
              name="title"
              required
              placeholder="Например: Нейросети для бизнеса"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Краткое описание курса"
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Цена (USD, 0 = бесплатно)</label>
            <input
              name="price_usd"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              placeholder="49"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Создать курс
          </button>
        </form>
      </div>
    </div>
  )
}
