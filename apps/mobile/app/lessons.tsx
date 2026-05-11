import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { useStudentSession } from "@/lib/student-session";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

type Lesson = {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
};

export default function ActiveLessonsScreen() {
    const { studentId, clearSession } = useStudentSession();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [qrToken, setQrToken] = useState("");
    const [qrSheetOpen, setQrSheetOpen] = useState(false);

    const canGenerate = useMemo(() => Boolean(studentId && selectedLesson), [studentId, selectedLesson]);

    const loadLessons = useCallback(async () => {
        const result = await api.activeLessons();
        setLessons(result.docs);
    }, []);

    useEffect(() => {
        if (studentId) {
            void loadLessons();
        }
    }, [studentId, loadLessons]);

    useEffect(() => {
        setQrToken("");
    }, [selectedLesson?.id]);

    if (!studentId) {
        return <Redirect href="/" />;
    }

    async function generateQr() {
        if (!selectedLesson || !studentId) return;
        const result = await api.createAttendanceToken(studentId, selectedLesson.id);
        setQrToken(result.token);
    }

    function openQrSheet() {
        setQrSheetOpen(true);
    }

    function closeQrSheet() {
        setQrSheetOpen(false);
    }

    function logout() {
        clearSession();
        router.replace("/");
    }

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="p-5">
                <View className="gap-5 pb-10">
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="min-w-0 flex-1">
                            <Text className="text-3xl font-bold">Lezioni attive</Text>
                            <Text className="mt-1 text-base">
                                Scegli una lezione e apri il QR di presenza.
                            </Text>
                        </View>
                        <Button variant="secondary" onPress={() => router.push("/teacher")}>
                            <Text>Docente</Text>
                        </Button>
                    </View>

                    <Card className="max-w-sm w-full self-center">
                        <CardHeader className="flex-row items-start justify-between gap-3">
                            <View className="min-w-0 flex-1 gap-1.5">
                                <CardTitle className="text-xl">Lezioni</CardTitle>
                                <CardDescription>
                                    Tocca una lezione per selezionarla, poi apri il QR.
                                </CardDescription>
                            </View>
                            <Button variant="secondary" onPress={loadLessons}>
                                <Text>Aggiorna</Text>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <View className="w-full gap-2">
                                {lessons.map((lesson) => (
                                    <Button
                                        key={lesson.id}
                                        variant={
                                            selectedLesson?.id === lesson.id ? "default" : "secondary"
                                        }
                                        onPress={() => setSelectedLesson(lesson)}>
                                        <Text>{lesson.title}</Text>
                                    </Button>
                                ))}
                            </View>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button
                                className="w-full"
                                disabled={!canGenerate}
                                onPress={openQrSheet}>
                                <Text>QR presenza</Text>
                            </Button>
                            <Button variant="secondary" className="w-full" onPress={logout}>
                                <Text>Esci</Text>
                            </Button>
                        </CardFooter>
                    </Card>
                </View>
            </ScrollView>

            <Modal
                visible={qrSheetOpen}
                transparent
                animationType="slide"
                onRequestClose={closeQrSheet}>
                <View className="flex-1 justify-end">
                    <Pressable
                        className="absolute inset-0 bg-black/50"
                        onPress={closeQrSheet}
                        accessibilityRole="button"
                        accessibilityLabel="Chiudi"
                    />
                    <View className="z-10 rounded-t-3xl bg-card px-5 pb-8 pt-6">
                        <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted" />
                        <View className="gap-1.5">
                            <Text className="text-xl font-semibold">QR presenza</Text>
                            <Text className="text-sm text-muted-foreground">
                                {selectedLesson
                                    ? selectedLesson.title
                                    : "Seleziona una lezione nella lista."}
                            </Text>
                        </View>
                        <View className="mt-6 items-center">
                            {qrToken ? (
                                <View className="rounded-lg bg-background p-4">
                                    <QRCode value={qrToken} size={220} />
                                </View>
                            ) : (
                                <View className="h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border">
                                    <Text className="text-center text-muted-foreground">
                                        Genera il codice da mostrare allo scanner del docente.
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className="mt-6 gap-2">
                            <Button className="w-full" disabled={!canGenerate} onPress={generateQr}>
                                <Text>Genera QR</Text>
                            </Button>
                            <Button variant="secondary" className="w-full" onPress={closeQrSheet}>
                                <Text>Chiudi</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
