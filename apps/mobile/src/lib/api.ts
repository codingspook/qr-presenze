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

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
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
