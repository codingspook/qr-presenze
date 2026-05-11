import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `JWT ${token}` } : {}),
            ...options.headers,
        },
    });

    const text = await response.text();
    let data: Record<string, unknown> = {};
    if (text.trim()) {
        try {
            data = JSON.parse(text) as Record<string, unknown>;
        } catch {
            throw new Error(
                `Risposta non valida dal server (${response.status}). Controlla che ${API_URL} sia raggiungibile.`,
            );
        }
    } else if (!response.ok) {
        throw new Error(`Richiesta fallita (${response.status}). Corpo vuoto.`);
    }

    if (!response.ok) {
        const message =
            typeof data.error === "string" ? data.error : `Request failed (${response.status})`;
        throw new Error(message);
    }

    return data as T;
}

export const api = {
    async login(email: string, password: string) {
        const data = await request<{
            token: string;
            user: { id: string; email: string; name?: string };
        }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        await SecureStore.setItemAsync("authToken", data.token);
        return data;
    },
    activeLessons() {
        return request<{
            docs: Array<{ id: string; title: string; startsAt: string; endsAt: string }>;
        }>("/api/lessons?where[active][equals]=true");
    },
    createAttendanceToken(studentId: string, lessonId: string) {
        return request<{ token: string }>("/api/attendance/lessonId", {
            method: "POST",
            body: JSON.stringify({ studentId, lessonId }),
        });
    },
    verifyAttendance(token: string) {
        return request<{ ok: boolean; error?: string }>("/api/attendance/verify", {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    },
};
