import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  const now = new Date().toISOString()

  const lessons = await payload.find({
    collection: 'lessons',
    where: {
      and: [
        { active: { equals: true } },
        { startsAt: { less_than_equal: now } },
        { endsAt: { greater_than_equal: now } },
      ],
    },
    sort: 'startsAt',
    limit: 50,
  })

  return NextResponse.json(lessons)
}
