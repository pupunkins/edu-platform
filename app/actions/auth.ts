'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

type AuthState = { error: string } | null

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
