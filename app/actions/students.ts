'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type State = { error?: string; success?: string } | null

export async function createStudent(_prev: State, formData: FormData): Promise<State> {
  const email = (formData.get('email') as string).trim()
  const password = formData.get('password') as string
  const name = (formData.get('name') as string).trim()

  if (password.length < 8) return { error: 'Пароль минимум 8 символов' }

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) return { error: error.message }

  // Создаём профиль
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name: name || null,
      tariff: 'basic',
      status: 'active',
    })
  }

  revalidatePath('/admin/students')
  return { success: `Аккаунт создан: ${email}` }
}

export async function deleteStudent(formData: FormData) {
  const userId = formData.get('userId') as string
  const supabase = createAdminClient()
  await supabase.auth.admin.deleteUser(userId)
  revalidatePath('/admin/students')
}

export async function blockStudent(formData: FormData) {
  const userId = formData.get('userId') as string
  const supabase = createAdminClient()
  await supabase.auth.admin.updateUserById(userId, { ban_duration: '876600h' })
  await supabase.from('profiles').update({ status: 'blocked' }).eq('id', userId)
  revalidatePath('/admin/students')
}

export async function unblockStudent(formData: FormData) {
  const userId = formData.get('userId') as string
  const supabase = createAdminClient()
  await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  await supabase.from('profiles').update({ status: 'active' }).eq('id', userId)
  revalidatePath('/admin/students')
}
