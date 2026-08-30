import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getAdminSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user || session.user.role?.toLowerCase() !== "admin") {
        return null;
    }

    return session;
}

export async function requireAdmin() {
    const session = await getAdminSession();

    if (!session) {
        const currentSession = await auth.api.getSession({
            headers: await headers(),
        });

        if (!currentSession) {
            redirect("/login");
        }

        redirect("/not-admin");
    }

    return session;
}