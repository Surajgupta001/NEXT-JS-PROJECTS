export const appwriteConfig = {
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    projectName: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME!,
    endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION_ID!,
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    secretKey: process.env.NEXT_APPWRITE_SECRET_KEY!,
};