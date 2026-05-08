import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const authHeaders = await headers()
  const { user } = await payload.auth({ headers: authHeaders })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ user })
}
