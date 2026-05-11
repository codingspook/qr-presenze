import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    plugins: [
        expoClient({
            storage: SecureStore,
        }),
    ],
});

export type SessionUser = {
    id: string;
    email: string;
    name?: string;
    image?: string | null;
    role?: "student" | "teacher" | string;
};
