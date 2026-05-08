import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { verifyAttendanceToken } from '@/lib/qr-token'

const MAX_TOKEN_AGE_MS = 3 * 60 * 1000

export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 })
  }

  try {
    const qr = await verifyAttendanceToken(token)
    const payload = await getPayloadClient()
    const now = Date.now()

    if (!qr.timestamp || now - qr.timestamp > MAX_TOKEN_AGE_MS || qr.timestamp > now + 10_000) {
      return NextResponse.json({ ok: false, error: 'QR expired or invalid timestamp' }, { status: 400 })
    }

    const lesson = await payload.findByID({
      collection: 'lessons',
      id: qr.lessonId,
      depth: 0,
    })

    const startsAt = new Date(lesson.startsAt).getTime()
    const endsAt = new Date(lesson.endsAt).getTime()

    if (!lesson.active || startsAt > now || endsAt < now) {
      return NextResponse.json({ ok: false, error: 'Lesson is not active' }, { status: 409 })
    }

    const duplicate = await payload.find({
      collection: 'attendances',
      where: {
        or: [
          { nonce: { equals: qr.nonce } },
          {
            and: [
              { student: { equals: qr.studentId } },
              { lesson: { equals: qr.lessonId } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (duplicate.totalDocs > 0) {
      return NextResponse.json({ ok: false, error: 'Attendance already registered' }, { status: 409 })
    }

    const attendance = await payload.create({
      collection: 'attendances',
      data: {
        student: qr.studentId,
        lesson: qr.lessonId,
        nonce: qr.nonce,
        status: 'present',
        checkedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ ok: true, attendance })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Invalid QR token' }, { status: 401 })
  }
}
