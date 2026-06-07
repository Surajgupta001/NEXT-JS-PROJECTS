"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";
import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { avatarPlaceholderUrl } from "../../../constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const validateEmail = (email: string) => {
    const normalizedEmail = normalizeEmail(email);

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
        throw new Error("Invalid email address");
    }

    return normalizedEmail;
};

const validateFullName = (fullName: string) => {
    const normalizedName = fullName.trim();

    if (normalizedName.length < 2 || normalizedName.length > 50) {
        throw new Error("Full name must be between 2 and 50 characters");
    }

    return normalizedName;
};

const validateOtp = (password: string) => {
    const normalizedOtp = password.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
        throw new Error("Invalid OTP");
    }

    return normalizedOtp;
};

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();
    const normalizedEmail = validateEmail(email);

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("email", [normalizedEmail])],
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), validateEmail(email));

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

export const createAccount = async ({ fullName, email }: { fullName: string; email: string; }) => {
    const safeEmail = validateEmail(email);
    const safeFullName = validateFullName(fullName);
    const existingUser = await getUserByEmail(safeEmail);

    const accountId = await sendEmailOTP({ email: safeEmail });
    
    if (!accountId) throw new Error("Failed to send an OTP");

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                fullName: safeFullName,
                email: safeEmail,
                avatar: avatarPlaceholderUrl,
                accountId,
            },
        );
    }

    return parseStringify({ accountId });
};

export const verifySecret = async ({
    accountId,
    password,
}: {
    accountId: string;
    password: string;
}) => {
    try {
        const { account } = await createAdminClient();

        const session = await account.createSession(accountId, validateOtp(password));

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }
};

export const getCurrentUser = async () => {
    try {
        const { databases, account } = await createSessionClient();

        const result = await account.get();

        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", result.$id)],
        );

        if (user.total <= 0) return null;

        return parseStringify(user.documents[0]);
    } catch {
        return null;
    }
};

export const signOutUser = async () => {
    const { account } = await createSessionClient();

    try {
        await account.deleteSession("current");
        (await cookies()).delete("appwrite-session");
    } catch (error) {
        handleError(error, "Failed to sign out user");
    } finally {
        redirect("/sign-in");
    }
};

export const signInUser = async ({ email }: { email: string }) => {
    try {
        const safeEmail = validateEmail(email);
        const existingUser = await getUserByEmail(safeEmail);

        // User exists, send OTP
        if (existingUser) {
            await sendEmailOTP({ email: safeEmail });
            return parseStringify({ accountId: existingUser.accountId });
        }

        return parseStringify({ accountId: null, error: "User not found" });
    } catch (error) {
        handleError(error, "Failed to sign in user");
    }
};
