import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { router } from "expo-router";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { api } from "@/lib/api";

type Lesson = {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
};

export default function StudentScreen() {
    const [email, setEmail] = useState("student@example.com");
    const [password, setPassword] = useState("password");
    const [studentId, setStudentId] = useState("");
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [qrToken, setQrToken] = useState("");

    const canGenerate = useMemo(() => studentId && selectedLesson, [studentId, selectedLesson]);

    async function login() {
        const result = await api.login(email, password);
        setStudentId(result.user.id);
        Alert.alert("Login effettuato", `Ciao ${result.user.name ?? result.user.email}`, [
            { text: "OK", onPress: () => loadLessons() },
        ]);
    }

    async function loadLessons() {
        const result = await api.activeLessons();
        setLessons(result.docs);
    }

    async function generateQr() {
        if (!selectedLesson || !studentId) return;
        const result = await api.createAttendanceToken(studentId, selectedLesson.id);
        setQrToken(result.token);
    }

    return (
        <ScrollView className="flex-1 bg-background px-5 py-6">
            <View className="gap-5 pb-10">
                <View>
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="min-w-0 flex-1">
                            <Text className="text-3xl font-bold text-white">Studente</Text>
                            <Text className="mt-1 text-base text-slate-300">
                                Login, selezione lezione e QR presenza.
                            </Text>
                        </View>
                        <Button
                            label="Docente"
                            variant="secondary"
                            onPress={() => router.push("/teacher")}
                        />
                    </View>
                </View>

                <Card>
                    <Text className="mb-3 text-lg font-semibold text-white">Accesso</Text>
                    <TextInput
                        className="mb-3 rounded-md border border-slate-600 bg-slate-900 px-3 py-3 text-white"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email"
                        placeholderTextColor="#94a3b8"
                    />
                    <TextInput
                        className="mb-3 rounded-md border border-slate-600 bg-slate-900 px-3 py-3 text-white"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        placeholder="password"
                        placeholderTextColor="#94a3b8"
                    />
                    <Button label="Login" onPress={login} />
                </Card>

                <Card>
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-lg font-semibold text-white">Lezioni attive</Text>
                        <Button label="Aggiorna" variant="secondary" onPress={loadLessons} />
                    </View>
                    <View className="gap-2">
                        {lessons.map((lesson) => (
                            <Button
                                key={lesson.id}
                                label={lesson.title}
                                variant={selectedLesson?.id === lesson.id ? "success" : "secondary"}
                                onPress={() => setSelectedLesson(lesson)}
                            />
                        ))}
                    </View>
                </Card>

                <Card className="items-center">
                    <Text className="mb-4 text-lg font-semibold text-white">QR presenza</Text>
                    {qrToken ? (
                        <View className="rounded-lg bg-white p-4">
                            <QRCode value={qrToken} size={220} />
                        </View>
                    ) : (
                        <View className="h-64 w-64 items-center justify-center rounded-lg border border-dashed border-slate-600">
                            <Text className="text-center text-slate-400">
                                Genera un QR dopo aver scelto la lezione.
                            </Text>
                        </View>
                    )}
                    <View className="mt-4 w-full">
                        <Button label="Genera QR" disabled={!canGenerate} onPress={generateQr} />
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
