import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

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

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const baseUrl = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: course.price_cents,
          product_data: { name: course.title },
        },
      },
    ],
    metadata: {
      user_id: user.id,
      course_id: course.id,
    },
    success_url: `${baseUrl}/courses/${course.id}?paid=1`,
    cancel_url: `${baseUrl}/courses/${course.id}`,
  })

  return NextResponse.json({ url: session.url })
}
