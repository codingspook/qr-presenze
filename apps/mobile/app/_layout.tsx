import "@/global.css";

import { StudentSessionProvider } from "@/lib/student-session";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { useUniwind } from "uniwind";

export default function RootLayout() {
    const { theme } = useUniwind();
    return (
        <StudentSessionProvider>
            <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
                <StatusBar style={theme === "dark" ? "light" : "dark"} />
                <Stack screenOptions={{ headerShown: false }} />
                <PortalHost />
            </ThemeProvider>
        </StudentSessionProvider>
    );
}
