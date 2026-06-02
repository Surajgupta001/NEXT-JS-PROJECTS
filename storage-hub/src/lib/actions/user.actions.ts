'use server';

import { ID, Query } from "appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";

/*
    **Create account Flow**
    -----------------------------
    1. user enter full name and email
    2. check if the user already exists in the email (we will use this to identify if we still need to create a user document for the user or not)
    3. send the to user's email
    4. This will send a secret key for creating a session. The secret key 
    5. Create a new user document of the user is a new user
    6. Return the user's accountId that will be used to complete the login
    7. Varify OTP and authenticate to login
*/

const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("email", email)]
    );
    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error
};

const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(
            ID.unique(),
            email,
        )
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send OTP email");
    }
};

export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });

    if (!accountId) {
        throw new Error("Failed to create account");
    }

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "https://placehold.net/avatar.svg",
                accountId,
            },
        );
    }
    return parseStringify({ accountId });
};