import { CameraView, useCameraPermissions } from 'expo-camera'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/button'
import { Card } from '@/components/card'
import { api } from '@/lib/api'

export default function TeacherScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [lastResult, setLastResult] = useState('')

  useEffect(() => {
    void requestPermission()
  }, [requestPermission])

  async function handleBarcode({ data }: { data: string }) {
    setScanned(true)
    const result = await api.verifyAttendance(data)
    setLastResult(result.ok ? 'Presenza registrata' : result.error ?? 'Errore verifica')
    Alert.alert(result.ok ? 'OK' : 'Errore', result.ok ? 'Presenza registrata' : result.error)
  }

  if (!permission) {
    return <Text className="p-6 text-white">Richiedo permesso fotocamera...</Text>
  }

  if (!permission.granted) {
    return <Text className="p-6 text-white">Permesso fotocamera negato.</Text>
  }

  return (
    <View className="flex-1 bg-background p-5">
      <Text className="mb-1 text-3xl font-bold text-white">Docente</Text>
      <Text className="mb-5 text-base text-slate-300">Scansiona QR e verifica esito presenza.</Text>
      <Card className="overflow-hidden p-0">
        <View className="h-96">
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarcode}
          />
        </View>
      </Card>
      <Text className="my-4 text-slate-200">{lastResult || 'In attesa di scansione'}</Text>
      {scanned && <Button label="Scansiona ancora" onPress={() => setScanned(false)} />}
    </View>
  )
}
