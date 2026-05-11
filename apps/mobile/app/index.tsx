import { authClient, type SessionUser } from "@/lib/auth-client";
import { Redirect } from "expo-router";

export default function IndexScreen() {
    const { data: session } = authClient.useSession();
    const user = session?.user as SessionUser | undefined;

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user.role === "teacher") {
        return <Redirect href="/teacher" />;
    }

    return <Redirect href="/lessons" />;
}
