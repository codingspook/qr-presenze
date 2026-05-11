import { API_URL, getAuthHeaders, handleResponse } from "./api-client";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
        credentials: "omit",
    });

    return handleResponse<T>(response);
}

export const api = {
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
