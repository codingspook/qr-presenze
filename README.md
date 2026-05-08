# Attendance QR Platform

Monorepo per verifica presenze con QR firmato.

- `apps/mobile`: app Expo React Native con Uniwind e componenti in stile react-native-reusables.
- `apps/backend`: Next.js + PayloadCMS con collection `users`, `lessons`, `attendances` e API dedicate.

## Avvio

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env.local
pnpm dev:backend
pnpm dev:mobile
```

Uniwind non e NativeWind: la configurazione Metro usa `withUniwindConfig` e `global.css` importa `tailwindcss` + `uniwind`.

## Flusso

1. Lo studente fa login e seleziona una lezione attiva.
2. L'app genera un JWT QR con `studentId`, `lessonId`, `timestamp`, `nonce`.
3. Il docente scansiona il QR.
4. Il backend verifica firma, lezione attiva, finestra anti-replay di 3 minuti e duplicati.
5. Payload registra la presenza.
