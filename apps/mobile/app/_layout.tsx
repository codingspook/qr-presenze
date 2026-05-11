import "react-native-gesture-handler";

import "@/global.css";

import { authClient, type SessionUser } from "@/lib/auth-client";
import { NAV_THEME } from "@/lib/theme";
import { PortalHost } from "@rn-primitives/portal";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";

export default function RootLayout() {
    const { theme } = useUniwind();
    const { data: session, isPending } = authClient.useSession();

    const themeValue = NAV_THEME[theme ?? "light"];

    if (isPending) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider value={themeValue}>
                    <StatusBar style={theme === "dark" ? "light" : "dark"} />
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: themeValue.colors.background,
                        }}>
                        <ActivityIndicator color={themeValue.colors.primary} />
                    </View>
                </ThemeProvider>
            </GestureHandlerRootView>
        );
    }

    const user = session?.user as SessionUser | undefined;
    const isAuthenticated = !!user;
    const role = user?.role;
    const isStudent = isAuthenticated && role === "student";
    const isTeacher = isAuthenticated && role === "teacher";

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={themeValue}>
                <StatusBar style={theme === "dark" ? "light" : "dark"} />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />

                    <Stack.Protected guard={!isAuthenticated}>
                        <Stack.Screen name="(auth)/login" />
                    </Stack.Protected>

                    <Stack.Protected guard={isStudent}>
                        <Stack.Screen name="lessons" />
                    </Stack.Protected>

                    <Stack.Protected guard={isTeacher}>
                        <Stack.Screen name="teacher" />
                    </Stack.Protected>
                </Stack>
                <PortalHost />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
