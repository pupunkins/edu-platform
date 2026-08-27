import crypto from 'crypto'

const SHOP_URL = 'https://pupupunkaoplata.payform.ru'

interface PaymentParams {
  orderId: string      // userId:courseId
  courseTitle: string
  priceRub: number     // цена в рублях
  customerEmail: string
  successUrl: string
  webhookUrl: string
}

export function buildPaymentUrl(p: PaymentParams): string {
  const params = new URLSearchParams({
    'products[0][name]': p.courseTitle,
    'products[0][price]': p.priceRub.toFixed(2),
    'products[0][quantity]': '1',
    'customer_email': p.customerEmail,
    'order_id': p.orderId,
    'urlReturn': p.successUrl,
    'urlNotification': p.webhookUrl,
    'do': 'pay',
  })
  return `${SHOP_URL}/?${params.toString()}`
}

// Prodamus подписывает вебхук: MD5(отсортированные params + secret)
export function verifySignature(body: Record<string, string>, secret: string): boolean {
  const { sign, ...rest } = body
  if (!sign) return false

  const sorted = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('&')

  const expected = crypto
    .createHmac('sha256', secret)
    .update(sorted)
    .digest('hex')

  return sign === expected
}

// orderId = "userId:courseId"
export function encodeOrderId(userId: string, courseId: string) {
  return `${userId}:${courseId}`
}

export function decodeOrderId(orderId: string) {
  const [userId, courseId] = orderId.split(':')
  return { userId, courseId }
}
