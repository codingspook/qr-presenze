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
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().min(1, "Inserisci la tua email").email("Inserisci un'email valida"),
    password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginValues) => {
        setSubmitError(null);
        const response = await authClient.signIn.email({
            email: values.email.trim(),
            password: values.password,
        });

        if (response.error) {
            setSubmitError(response.error.message ?? "Email o password non corretti");
            return;
        }

        // Il redirect verso lessons/teacher avviene automaticamente da app/index.tsx
        // quando useSession si aggiorna con il nuovo utente.
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView
                    contentContainerClassName="grow justify-center p-5 gap-6"
                    keyboardShouldPersistTaps="handled">
                    <View className="gap-1">
                        <Text className="text-3xl font-bold">Accedi</Text>
                        <Text className="text-base text-muted-foreground">
                            Inserisci le tue credenziali per continuare.
                        </Text>
                    </View>

                    <View className="gap-4">
                        <View className="gap-2">
                            <Label>Email</Label>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        keyboardType="email-address"
                                        editable={!isSubmitting}
                                        placeholder="m@example.com"
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.email && (
                                <Text className="text-xs text-destructive">
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>

                        <View className="gap-2">
                            <Label>Password</Label>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        secureTextEntry
                                        autoCapitalize="none"
                                        autoComplete="password"
                                        editable={!isSubmitting}
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.password && (
                                <Text className="text-xs text-destructive">
                                    {errors.password.message}
                                </Text>
                            )}
                        </View>

                        {submitError && (
                            <View className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
                                <Text className="text-sm text-destructive">{submitError}</Text>
                            </View>
                        )}
                    </View>

                    <Button onPress={handleSubmit(onSubmit)}>
                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text>Accedi</Text>}
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
