import { jwtVerify, SignJWT } from 'jose'

const encoder = new TextEncoder()

export type QRTokenPayload = {
  studentId: string
  lessonId: string
  timestamp: number
  nonce: string
}

function getSecret() {
  const secret = process.env.QR_JWT_SECRET
  if (!secret) {
    throw new Error('QR_JWT_SECRET is not configured')
  }

  return encoder.encode(secret)
}

export async function signAttendanceToken(payload: QRTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('3m')
    .sign(getSecret())
}

export async function verifyAttendanceToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())

  return {
    studentId: String(payload.studentId),
    lessonId: String(payload.lessonId),
    timestamp: Number(payload.timestamp),
    nonce: String(payload.nonce),
  }
}
