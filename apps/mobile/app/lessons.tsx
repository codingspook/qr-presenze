import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { authClient, type SessionUser } from "@/lib/auth-client";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
    type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Redirect, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    Pressable,
    RefreshControl,
    useWindowDimensions,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

type Lesson = {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
};

function formatLessonSchedule(startsAt: string, endsAt: string): string {
    try {
        const start = new Date(startsAt);
        const end = new Date(endsAt);
        const datePart: Intl.DateTimeFormatOptions = {
            weekday: "short",
            day: "numeric",
            month: "short",
        };
        const timePart: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
        const sameDay =
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate();
        const dateLabel = start.toLocaleDateString("it-IT", datePart);
        const from = start.toLocaleTimeString("it-IT", timePart);
        const to = end.toLocaleTimeString("it-IT", timePart);
        if (sameDay) {
            return `${dateLabel} · ${from}–${to}`;
        }
        return `${start.toLocaleDateString("it-IT", datePart)} ${from} — ${end.toLocaleDateString("it-IT", datePart)} ${to}`;
    } catch {
        return `${startsAt} — ${endsAt}`;
    }
}

export default function ActiveLessonsScreen() {
    const { data: session } = authClient.useSession();
    const user = session?.user as SessionUser | undefined;
    const studentId = user?.id ?? null;
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [qrToken, setQrToken] = useState("");
    const [qrLoading, setQrLoading] = useState(false);
    const [qrSheetOpen, setQrSheetOpen] = useState(false);
    const [listRefreshing, setListRefreshing] = useState(false);
    const [listLoading, setListLoading] = useState(true);

    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { theme } = useUniwind();
    const qrSpinnerColor = theme === "dark" ? THEME.dark.primary : THEME.light.primary;

    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleClosePress = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [bottomSheetRef]);

    const renderQrSheetBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        [],
    );

    const loadLessons = useCallback(async () => {
        try {
            const result = await api.activeLessons();
            setLessons(result.docs);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (studentId) {
            void loadLessons();
        }
    }, [studentId, loadLessons]);

    useEffect(() => {
        if (!qrSheetOpen || !selectedLesson || !studentId) {
            return;
        }
        let cancelled = false;
        setQrLoading(true);
        setQrToken("");
        void api
            .createAttendanceToken(studentId, selectedLesson.id)
            .then((result) => {
                if (!cancelled) {
                    setQrToken(result.token);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setQrLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [qrSheetOpen, selectedLesson?.id, studentId]);

    const refreshQr = useCallback(async () => {
        if (!selectedLesson || !studentId) return;
        setQrLoading(true);
        setQrToken("");
        try {
            const result = await api.createAttendanceToken(studentId, selectedLesson.id);
            setQrToken(result.token);
        } finally {
            setQrLoading(false);
        }
    }, [selectedLesson, studentId]);

    const onListRefresh = useCallback(async () => {
        setListRefreshing(true);
        try {
            await loadLessons();
        } finally {
            setListRefreshing(false);
        }
    }, [loadLessons]);

    const handleLessonPress = useCallback((lesson: Lesson) => {
        setSelectedLesson(lesson);
        setQrSheetOpen(true);
    }, []);

    const logout = useCallback(async () => {
        await authClient.signOut();
        router.replace("/");
    }, []);

    const listHeader = useMemo(
        () => (
            <View className="mb-4 gap-4">
                <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1">
                        <Text className="text-2xl font-bold tracking-tight">Lezioni attive</Text>
                        <Text className="mt-1 text-sm text-muted-foreground">
                            Tocca una lezione per aprire il QR di presenza.
                        </Text>
                    </View>
                </View>
                <View className="flex-row flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" onPress={() => void loadLessons()}>
                        <Text>Aggiorna elenco</Text>
                    </Button>
                    <View className="flex-1" />
                    <Button variant="outline" size="sm" onPress={() => void logout()}>
                        <Text>Esci</Text>
                    </Button>
                </View>
            </View>
        ),
        [loadLessons, logout],
    );

    const listEmpty = useMemo(
        () => (
            <View className="min-h-48 justify-center rounded-xl border border-dashed border-border bg-card/50 py-14 px-6">
                {listLoading ? (
                    <ActivityIndicator size="large" color={qrSpinnerColor} />
                ) : (
                    <>
                        <Text className="text-center font-medium text-card-foreground">
                            Nessuna lezione attiva
                        </Text>
                        <Text className="mt-2 text-center text-sm text-muted-foreground">
                            Torna più tardi o aggiorna l&apos;elenco.
                        </Text>
                        <Button
                            variant="secondary"
                            className="mt-6 self-center"
                            onPress={() => void loadLessons()}>
                            <Text>Riprova</Text>
                        </Button>
                    </>
                )}
            </View>
        ),
        [loadLessons, listLoading, qrSpinnerColor],
    );

    const renderItem: ListRenderItem<Lesson> = useCallback(
        ({ item: lesson }) => {
            const schedule = formatLessonSchedule(lesson.startsAt, lesson.endsAt);
            const selected = selectedLesson?.id === lesson.id;
            return (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Apri QR per ${lesson.title}`}
                    onPress={() => handleLessonPress(lesson)}
                    className={cn(
                        "rounded-xl border bg-card px-4 py-3.5 shadow-sm shadow-black/5 active:opacity-90",
                        selected && qrSheetOpen
                            ? "border-primary bg-secondary/35"
                            : "border-border",
                    )}>
                    <View className="flex-row items-center gap-3">
                        <View className="min-w-0 flex-1">
                            <Text
                                className="text-base font-semibold leading-snug"
                                numberOfLines={2}>
                                {lesson.title}
                            </Text>
                            <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                                {schedule}
                            </Text>
                        </View>
                        <Text className="text-lg text-muted-foreground">›</Text>
                    </View>
                </Pressable>
            );
        },
        [handleLessonPress, qrSheetOpen, selectedLesson?.id],
    );

    if (!studentId) {
        return <Redirect href="/" />;
    }

    return (
        <View className="flex-1">
            <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
                <FlatList
                    data={lessons}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={listHeader}
                    ListEmptyComponent={listEmpty}
                    contentContainerClassName="px-5 pb-8 pt-4"
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    refreshControl={
                        <RefreshControl refreshing={listRefreshing} onRefresh={onListRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>

            <BottomSheet
                ref={bottomSheetRef}
                enablePanDownToClose
                enableDynamicSizing
                maxDynamicContentSize={height * 0.92}
                backdropComponent={renderQrSheetBackdrop}
                backgroundStyle={{
                    backgroundColor: THEME[theme ?? "light"].card,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                }}
                handleIndicatorStyle={{
                    width: 40,
                    backgroundColor: THEME[theme ?? "light"].muted,
                }}
                accessibilityLabel="QR presenza">
                <BottomSheetView
                    className="px-5 pb-8 pt-2"
                    style={{ paddingBottom: insets.bottom }}>
                    <View className="gap-1.5">
                        <Text className="text-xl font-semibold">QR presenza</Text>
                        <Text className="text-sm text-muted-foreground">
                            {selectedLesson?.title ?? "Lezione"}
                        </Text>
                    </View>
                    <View className="mt-6 min-h-64 items-center justify-center">
                        {qrLoading ? (
                            <ActivityIndicator size="large" color={qrSpinnerColor} />
                        ) : qrToken ? (
                            <View className="rounded-lg bg-background p-4">
                                <QRCode value={qrToken} size={220} />
                            </View>
                        ) : (
                            <View className="h-64 w-64 items-center justify-center rounded-lg border border-dashed border-border px-4">
                                <Text className="text-center text-sm text-muted-foreground">
                                    Impossibile preparare il codice. Riprova.
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="mt-6 gap-2">
                        <Button
                            className="w-full"
                            variant="secondary"
                            disabled={qrLoading || !selectedLesson}
                            onPress={() => void refreshQr()}>
                            <Text>Nuovo codice</Text>
                        </Button>
                        <Button variant="outline" className="w-full" onPress={handleClosePress}>
                            <Text>Chiudi</Text>
                        </Button>
                    </View>
                </BottomSheetView>
            </BottomSheet>
        </View>
    );
}
