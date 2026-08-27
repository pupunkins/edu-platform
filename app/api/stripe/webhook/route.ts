import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, course_id } = session.metadata ?? {}

    if (user_id && course_id) {
      const supabase = createAdminClient()
      await supabase.from('enrollments').upsert(
        { user_id, course_id, access_until: null },
        { onConflict: 'user_id,course_id' }
      )
    }
  }

  return NextResponse.json({ ok: true })
}
