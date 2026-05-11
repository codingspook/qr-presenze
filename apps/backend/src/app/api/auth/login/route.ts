import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

function isPayloadHttpError(error: unknown): error is { status: number; message?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatori' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    return NextResponse.json({
      token: result.token,
      user: result.user,
    })
  } catch (error: unknown) {
    if (isPayloadHttpError(error) && error.status === 401) {
      return NextResponse.json(
        { error: error.message ?? 'Email o password non corretti' },
        { status: 401 },
      )
    }

    console.error(error)
    return NextResponse.json({ error: 'Errore durante il login' }, { status: 500 })
  }
}
