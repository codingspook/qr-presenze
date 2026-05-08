import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const payload = await getPayloadClient()

  const result = await payload.login({
    collection: 'users',
    data: { email, password },
  })

  return NextResponse.json({
    token: result.token,
    user: result.user,
  })
}
