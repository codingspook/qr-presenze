import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { useStudentSession } from "@/lib/student-session";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const { studentId, setStudentId } = useStudentSession();
    const [email, setEmail] = useState("student@example.com");
    const [password, setPassword] = useState("password");

    if (studentId) {
        return <Redirect href="/lessons" />;
    }

    async function login() {
        try {
            const result = await api.login(email, password);
            setStudentId(result.user.id);
            router.replace("/lessons");
        } catch (error) {
            console.error(error);
            Alert.alert("Errore", "Email o password errata");
        }
    }

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="p-5">
                <View className="gap-5 pb-10">
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="min-w-0 flex-1">
                            <Text className="text-3xl font-bold">Studente</Text>
                            <Text className="mt-1 text-base">
                                Accedi per vedere le lezioni attive.
                            </Text>
                        </View>
                        <Button variant="secondary" onPress={() => router.push("/teacher")}>
                            <Text>Docente</Text>
                        </Button>
                    </View>

                    <Card className="max-w-sm w-full self-center">
                        <CardHeader className="flex-row">
                            <View className="flex-1 gap-1.5">
                                <CardTitle className="text-xl">Accesso</CardTitle>
                                <CardDescription>
                                    Inserisci email e password per continuare.
                                </CardDescription>
                            </View>
                        </CardHeader>
                        <CardContent>
                            <View className="w-full gap-4">
                                <View className="gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="m@example.com"
                                    />
                                </View>
                                <View className="gap-2">
                                    <Label>Password</Label>
                                    <Input
                                        secureTextEntry
                                        autoComplete="password"
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="••••••••"
                                    />
                                </View>
                            </View>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button className="w-full" onPress={login}>
                                <Text>Login</Text>
                            </Button>
                        </CardFooter>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
