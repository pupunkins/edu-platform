import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decodeOrderId } from '@/lib/prodamus'

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = Object.fromEntries(new URLSearchParams(text))

  const { order_id, payment_status } = params

  // Принимаем только успешные платежи
  if (payment_status !== 'success' && payment_status !== 'paid') {
    return NextResponse.json({ ok: true })
  }

  if (!order_id) return NextResponse.json({ error: 'No order_id' }, { status: 400 })

  const { userId, courseId } = decodeOrderId(order_id)
  if (!userId || !courseId) return NextResponse.json({ error: 'Bad order_id' }, { status: 400 })

  const supabase = createAdminClient()
  await supabase.from('enrollments').upsert(
    { user_id: userId, course_id: courseId, access_until: null },
    { onConflict: 'user_id,course_id' }
  )

  return NextResponse.json({ ok: true })
}
