import { and, desc, eq } from "drizzle-orm";
import { database } from "../../database/client.js";
import { job_posts } from "../../database/schema.js";
import { ApiError } from "../../utils/api-error.js";
import { imagekit } from "../../config/imagekit.js";
import { env } from "../../config/env.js";
import { randomUUID } from "crypto";

type JobData = Omit<typeof job_posts.$inferInsert, "client_id">;
type Attachment = NonNullable<JobData["attachments"]>[number];

const deleteDocuments = async (attachments: Attachment[] = []) => Promise.allSettled(
    attachments
        .filter(({ fileId }) => fileId)
        .map(({ fileId }) => imagekit.files.delete(fileId)),
);

const uploadDocuments = async (userId: string, attachments: Attachment[] = []) => {
    const uploaded: Attachment[] = [];
    const uploadedIds: string[] = [];

    try {
        for (const attachment of attachments) {
            if (!attachment.fileUrl.startsWith('data:')) {
                uploaded.push(attachment);
                continue;
            }

            if (!env.imagekitPrivateKey) {
                throw new ApiError(500, "ImageKit private key is not configured.");
            }

            const file = await imagekit.files.upload({
                file: attachment.fileUrl,
                fileName: `job-document-${randomUUID()}`,
                folder: `/freelancing-marketplace/job-attachments/${userId}`,
            });

            if (!file.fileId || !file.url) {
                throw new ApiError(500, "Failed to upload document to ImageKit.");
            };

            uploaded.push({
                ...attachment,
                fileId: file.fileId,
                fileUrl: file.url,
            });
            uploadedIds.push(file.fileId);
        }

        return { uploaded, uploadedIds };
    } catch (error) {
        await Promise.allSettled(
            uploadedIds.map((fileId) => imagekit.files.delete(fileId)),
        );
        throw error;
    }
};


export const createJobPost = async (userId: string, data: JobData) => {
    const { uploaded: attachments, uploadedIds } = await uploadDocuments(userId, data.attachments ?? []);

    try {
        const [job] = await database.insert(job_posts).values({
            ...data,
            attachments,
            client_id: userId,
        }).returning();

        return job;
    } catch (error) {
        await Promise.allSettled(
            uploadedIds.map((fileId) => imagekit.files.delete(fileId)),
        );
        throw error;
    }

};

export const getJobPosts = async (userId: string, jobId?: string) => {
    return database
        .select()
        .from(job_posts)
        .where(jobId ? and(eq(job_posts.client_id, userId), eq(job_posts.id, jobId)) : eq(job_posts.client_id, userId))
        .orderBy(desc(job_posts.created_At));
};

export const updateJobPost = async (userId: string, jobId: string, data: Partial<typeof job_posts.$inferInsert>) => {
    const [existingJob] = await database
        .select()
        .from(job_posts)
        .where(and(
            eq(job_posts.id, jobId),
            eq(job_posts.client_id, userId),
        ))
        .limit(1);

    if (!existingJob) {
        throw new ApiError(404, "Editable job post not found.");
    }

    if (existingJob.status === "HIRED") {
        throw new ApiError(403, "This job post cannot be edited because a hire has already been made.");
    }

    const { uploaded: attachments, uploadedIds } = await uploadDocuments(userId, data.attachments ?? []);

    let job;

    try {
        [job] = await database
            .update(job_posts)
            .set({
                ...data,
                attachments,
                updated_At: new Date(),
            })
            .where(and(
                eq(job_posts.id, jobId),
                eq(job_posts.client_id, userId),
            ))
            .returning();

    } catch (error) {
        await Promise.allSettled(
            uploadedIds.map((fileId) => imagekit.files.delete(fileId)),
        );
        throw error;
    }

    if (!job) {
        await Promise.allSettled(
            uploadedIds.map((fileId) => imagekit.files.delete(fileId)),
        );
        throw new ApiError(404, "Editable job post not found.");
    }

    const retainedIds = new Set(attachments.map(({ fileId }) => fileId));
    await deleteDocuments(existingJob.attachments?.filter(({ fileId }) => !retainedIds.has(fileId)));

    return job;
};

export const deleteJobPost = async (userId: string, jobId: string) => {
    const [job] = await database
        .delete(job_posts)
        .where(and(
            eq(job_posts.id, jobId),
            eq(job_posts.client_id, userId),
            eq(job_posts.status, "HIRED"),
        ))
        .returning();

    if (!job) {
        throw new ApiError(404, "Job post not found or cannot be deleted.");
    }

    await deleteDocuments(job.attachments ?? []);

    return job;
};
