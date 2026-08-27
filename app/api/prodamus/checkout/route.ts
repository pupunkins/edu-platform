import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { buildPaymentUrl, encodeOrderId } from '@/lib/prodamus'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, price_cents')
    .eq('id', courseId)
    .single()

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const baseUrl = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''
  const priceRub = course.price_cents / 100

  const url = buildPaymentUrl({
    orderId: encodeOrderId(user.id, course.id),
    courseTitle: course.title,
    priceRub,
    customerEmail: user.email ?? '',
    successUrl: `${baseUrl}/courses/${course.id}?paid=1`,
    webhookUrl: `${baseUrl}/api/prodamus/webhook`,
  })

  return NextResponse.json({ url })
}
