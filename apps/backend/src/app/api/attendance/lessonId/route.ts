import { NextResponse } from 'next/server'

import { signAttendanceToken } from '@/lib/qr-token'

export async function POST(request: Request) {
  const { studentId, lessonId } = await request.json()

  if (!studentId || !lessonId) {
    return NextResponse.json({ error: 'studentId and lessonId are required' }, { status: 400 })
  }

  const token = await signAttendanceToken({
    studentId,
    lessonId,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  })

  return NextResponse.json({ token })
}
