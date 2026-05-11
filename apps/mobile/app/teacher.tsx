import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [lastResult, setLastResult] = useState("");

    useEffect(() => {
        void requestPermission();
    }, [requestPermission]);

    const handleBarcode = useCallback(async ({ data }: { data: string }) => {
        setScanned(true);
        try {
            const result = await api.verifyAttendance(data);
            const message = result.ok ? "Presenza registrata" : result.error ?? "Errore verifica";
            setLastResult(message);
            Alert.alert(result.ok ? "OK" : "Errore", message);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Errore verifica";
            setLastResult(message);
            Alert.alert("Errore", message);
        }
    }, []);

    const logout = useCallback(async () => {
        await authClient.signOut();
        router.replace("/");
    }, []);

    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="p-6">
                    <Text className="text-foreground">Richiedo permesso fotocamera...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <ScrollView contentContainerClassName="p-6 gap-4">
                    <Text className="text-xl font-semibold text-foreground">
                        Permesso fotocamera negato
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                        Per scansionare i QR delle presenze occorre concedere l&apos;accesso alla
                        fotocamera.
                    </Text>
                    <Button onPress={() => void requestPermission()}>
                        <Text>Richiedi di nuovo</Text>
                    </Button>
                    <Button variant="outline" onPress={() => void logout()}>
                        <Text>Esci</Text>
                    </Button>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerClassName="p-5 gap-4">
                <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                        <Text className="text-2xl font-bold tracking-tight">Docente</Text>
                        <Text className="mt-1 text-sm text-muted-foreground">
                            Scansiona QR e verifica esito presenza.
                        </Text>
                    </View>
                    <Button variant="outline" size="sm" onPress={() => void logout()}>
                        <Text>Esci</Text>
                    </Button>
                </View>

                <Card className="overflow-hidden p-0">
                    <View className="h-96">
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                            onBarcodeScanned={scanned ? undefined : handleBarcode}
                        />
                    </View>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Esito</CardTitle>
                        <CardDescription>
                            {lastResult ? lastResult : "In attesa di scansione"}
                        </CardDescription>
                    </CardHeader>
                    {scanned && (
                        <CardContent>
                            <Button onPress={() => setScanned(false)}>
                                <Text>Scansiona ancora</Text>
                            </Button>
                        </CardContent>
                    )}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
