'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { extractYoutubeId } from '@/lib/youtube'

export async function createCourse(formData: FormData) {
  const supabase = await createServerClient()
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('courses')
    .insert({ title, description })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function updateCourse(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('courses')
    .update({ title, description })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath(`/admin/courses/${id}`)
}

export async function createModule(formData: FormData) {
  const supabase = await createServerClient()
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string

  const { data: existing } = await supabase
    .from('modules')
    .select('order_index')
    .eq('course_id', course_id)
    .order('order_index', { ascending: false })
    .limit(1)

  const order_index = existing?.[0]?.order_index != null ? existing[0].order_index + 1 : 0

  const { error } = await supabase
    .from('modules')
    .insert({ course_id, title, order_index })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}

export async function updateModule(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const is_published = formData.get('is_published') === 'true'

  const { error } = await supabase
    .from('modules')
    .update({ title, is_published })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}

export async function createLesson(formData: FormData) {
  const supabase = await createServerClient()
  const module_id = formData.get('module_id') as string
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const video_id = extractYoutubeId(formData.get('video_id') as string)
  const duration_seconds = parseInt(formData.get('duration_seconds') as string) || 0

  const { error } = await supabase
    .from('lessons')
    .insert({ module_id, title, description, video_id, duration_seconds })

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}

export async function updateLesson(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const course_id = formData.get('course_id') as string
  const module_id = formData.get('module_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const video_id = extractYoutubeId(formData.get('video_id') as string)
  const duration_seconds = parseInt(formData.get('duration_seconds') as string) || 0
  const is_published = formData.get('is_published') === 'true'

  const { error } = await supabase
    .from('lessons')
    .update({ title, description, video_id, duration_seconds, is_published })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}

export async function deleteCourse(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteModule(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('modules').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}

export async function deleteLesson(formData: FormData) {
  const supabase = await createServerClient()
  const id = formData.get('id') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/courses/${course_id}`)
}
