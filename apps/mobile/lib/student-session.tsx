import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type StudentSessionContextValue = {
    studentId: string | null;
    setStudentId: (id: string | null) => void;
    clearSession: () => void;
};

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
    const [studentId, setStudentIdState] = useState<string | null>(null);

    const setStudentId = useCallback((id: string | null) => {
        setStudentIdState(id);
    }, []);

    const clearSession = useCallback(() => {
        setStudentIdState(null);
    }, []);

    const value = useMemo(
        () => ({ studentId, setStudentId, clearSession }),
        [studentId, setStudentId, clearSession],
    );

    return (
        <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>
    );
}

export function useStudentSession() {
    const ctx = useContext(StudentSessionContext);
    if (!ctx) {
        throw new Error("useStudentSession must be used within StudentSessionProvider");
    }
    return ctx;
}
