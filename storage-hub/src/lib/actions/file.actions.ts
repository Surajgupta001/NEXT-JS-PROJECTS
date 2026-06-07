'use server';

import { createAdminClient, createSessionClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    throw error;
};

const ALLOWED_SORT_FIELDS = new Set(["$createdAt", "$updatedAt", "name", "size"]);
const ALLOWED_REVALIDATE_PATHS = new Set(["/", "/documents", "/images", "/media", "/others"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePath = (path: string) => {
    return ALLOWED_REVALIDATE_PATHS.has(path) ? path : "/";
};

const sanitizeText = (value: string, maxLength: number) => {
    return value.trim().slice(0, maxLength);
};

const sanitizeEmails = (emails: string[]) => {
    return Array.from(
        new Set(
            emails
                .map((email) => email.trim().toLowerCase())
                .filter((email) => EMAIL_PATTERN.test(email))
        )
    );
};

const getCurrentUserOrThrow = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw new Error("User not authenticated");
    }

    return currentUser;
};

const getOwnedFileOrThrow = async (fileId: string) => {
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUserOrThrow();

    const file = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        fileId
    );

    if (file.owner !== currentUser.$id) {
        throw new Error("Not authorized to modify this file");
    }

    return { databases, currentUser, file };
};

export const uploadFiles = async ({ file, path }: UploadFileProps) => {
    const { storage, databases } = await createAdminClient();

    try {
        const currentUser = await getCurrentUserOrThrow();
        const inputFile = InputFile.fromBuffer(file, file.name);
        const fileType = getFileType(file.name);

        const bucketFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            inputFile
        );

        const fileDocument = {
            type: fileType.type,
            name: sanitizeText(bucketFile.name, 255),
            url: constructFileUrl(bucketFile.$id),
            extension: fileType.extension,
            size: bucketFile.sizeOriginal,
            owner: currentUser.$id,
            accountId: currentUser.accountId,
            users: [],
            bucketFileId: bucketFile.$id,
        };

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument
        )
            .catch(async (error: unknown) => {
                await storage.deleteFile(
                    appwriteConfig.bucketId,
                    bucketFile.$id
                );
                return handleError(error, "Failed creating file document");
            });

        revalidatePath(normalizePath(path));

        return parseStringify(newFile);
    } catch (error) {
        handleError(error, "Failed uploading file");
    }
};

const createQueries = (currentUser: FileDocument & { email: string }, types: string[], searchText: string, sort: string, limit?: number) => {
    const queries = [
        Query.or([
            Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email]),
        ]),
    ];

    const validTypes = types.filter((type): type is FileType =>
        ["document", "image", "video", "audio", "other"].includes(type)
    );
    const sanitizedSearch = sanitizeText(searchText, 100);

    if (validTypes.length > 0) queries.push(Query.equal("type", validTypes));
    if (sanitizedSearch) queries.push(Query.contains("name", sanitizedSearch));
    if (limit) queries.push(Query.limit(Math.min(Math.max(limit, 1), 50)));

    if (sort) {
        const [sortBy, orderBy] = sort.split("-");

        if (ALLOWED_SORT_FIELDS.has(sortBy)) {
            queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
        }
    }

    return queries;
};

export const getFiles = async ({ types = [], searchText = "", sort = '$createdAt-desc', limit }: GetFilesProps) => {
    const { databases } = await createAdminClient();

    try {
        const currentUser = await getCurrentUserOrThrow();

        const queries = createQueries(currentUser, types, searchText, sort, limit);

        // console.log({ currentUser, queries });

        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            queries
        );

        // Populate owner info for each file
        const ownerIds = Array.from(
            new Set(
                files.documents
                    .map(file => typeof file.owner === "string" ? file.owner : null)
                    .filter(Boolean) as string[]
            )
        );

        const usersMap = new Map();
        if (ownerIds.length > 0) {
            const usersResult = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal("$id", ownerIds)]
            );
            usersResult.documents.forEach(user => {
                usersMap.set(user.$id, user);
            });
        }

        const populatedDocuments = files.documents.map(file => {
            if (typeof file.owner === "string") {
                const user = usersMap.get(file.owner);
                return {
                    ...file,
                    owner: user ? {
                        fullName: user.fullName,
                        email: user.email,
                        avatar: user.avatar,
                        accountId: user.accountId
                    } : {
                        fullName: "Unknown",
                        email: "",
                        avatar: "",
                        accountId: ""
                    }
                };
            }
            return file;
        });

        files.documents = populatedDocuments;

        // console.log({ files });
        return parseStringify(files);
    } catch (error) {
        handleError(error, "Failed fetching files");
    }
};

export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
    try {
        const { databases, file } = await getOwnedFileOrThrow(fileId);
        const safeName = sanitizeText(name, 120);
        const safeExtension = sanitizeText(extension || file.extension, 20);

        if (!safeName) {
            throw new Error("File name is required");
        }

        const newName = safeExtension ? `${safeName}.${safeExtension}` : safeName;
        const updatedFile = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            fileId,
            {
                name: newName,
            },
        );
        revalidatePath(normalizePath(path));

        return parseStringify(updatedFile);
    } catch (error) {
        handleError(error, "Failed renaming file");
    }
};

export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
    try {
        const { databases, currentUser } = await getOwnedFileOrThrow(fileId);
        const safeEmails = sanitizeEmails(emails).filter((email) => email !== currentUser.email);

        const updatedFile = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            fileId,
            {
                users: safeEmails,
            },
        );

        revalidatePath(normalizePath(path));
        return parseStringify(updatedFile);
    } catch (error) {
        handleError(error, "Failed to share file");
    }
};

export const deleteFile = async ({ fileId, bucketFileId, path }: DeleteFileProps) => {
    const { storage } = await createAdminClient();

    try {
        const { databases, file } = await getOwnedFileOrThrow(fileId);

        if (file.bucketFileId !== bucketFileId) {
            throw new Error("File storage id mismatch");
        }

        const deletedFile = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            fileId,
        );

        if (deletedFile) {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
        }

        revalidatePath(normalizePath(path));
        return parseStringify({ status: "success" });
    } catch (error) {
        handleError(error, "Failed to delete file");
    }
};

export async function getTotalSpaceUsed() {
    try {
        const { databases } = await createSessionClient();
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User is not authenticated.");

        const files = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            [Query.equal("owner", [currentUser.$id])],
        );

        const totalSpace = {
            image: { size: 0, latestDate: "" },
            document: { size: 0, latestDate: "" },
            video: { size: 0, latestDate: "" },
            audio: { size: 0, latestDate: "" },
            other: { size: 0, latestDate: "" },
            used: 0,
            all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
        };

        files.documents.forEach((file) => {
            const fileType = file.type as FileType;
            totalSpace[fileType].size += file.size;
            totalSpace.used += file.size;

            if (
                !totalSpace[fileType].latestDate ||
                new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
            ) {
                totalSpace[fileType].latestDate = file.$updatedAt;
            }
        });

        return parseStringify(totalSpace);
    } catch (error) {
        handleError(error, "Error calculating total space used:, ");
    }
}
