import Constants from "expo-constants";

import { authClient } from "./auth-client";

export const API_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "http://localhost:3000";

export async function handleResponse<T>(response: Response): Promise<T> {
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
            typeof data.error === "string"
                ? data.error
                : typeof (data as { message?: unknown }).message === "string"
                  ? ((data as { message?: string }).message as string)
                  : `Request failed (${response.status})`;
        throw new Error(message);
    }

    return data as T;
}

export function getAuthHeaders(contentType: string | null = "application/json"): HeadersInit {
    const cookies = authClient.getCookie();
    const headers: Record<string, string> = {};

    if (contentType) {
        headers["Content-Type"] = contentType;
    }
    if (cookies) {
        headers["Cookie"] = cookies;
    }

    return headers;
}
