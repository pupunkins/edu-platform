'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function grantAccess(formData: FormData) {
  const supabase = createAdminClient()
  const user_id = formData.get('user_id') as string
  const course_id = formData.get('course_id') as string
  const access_until = formData.get('access_until') as string

  await supabase.from('enrollments').upsert(
    {
      user_id,
      course_id,
      access_until: access_until || null,
    },
    { onConflict: 'user_id,course_id' }
  )

  revalidatePath(`/admin/students/${user_id}`)
}

export async function updateAccessUntil(formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const user_id = formData.get('user_id') as string
  const access_until = formData.get('access_until') as string

  await supabase
    .from('enrollments')
    .update({ access_until: access_until || null })
    .eq('id', id)

  revalidatePath(`/admin/students/${user_id}`)
}

export async function revokeAccess(formData: FormData) {
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  const user_id = formData.get('user_id') as string

  await supabase.from('enrollments').delete().eq('id', id)
  revalidatePath(`/admin/students/${user_id}`)
}
