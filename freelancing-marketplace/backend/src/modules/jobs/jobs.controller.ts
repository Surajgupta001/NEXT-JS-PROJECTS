import { request, RequestHandler, response } from "express";
import { ApiError } from "../../utils/api-error.js";
import { randomUUID } from "crypto";
import { asynchandler } from "../../utils/async-handler.js";
import { createJobPost, getJobPosts, updateJobPost } from "./jobs.service.js";

const requireClient = (request: Parameters<RequestHandler>[0]) => {
    const auth = request.auth!;

    if (auth.role !== "client") {
        throw new ApiError(403, "Access denied. Only clients can access this resource.");
    }

    return auth;
};

const requireText = (value: string | string[] | undefined, name: string) => {
    if (typeof value !== "string" || value.trim() === "") {
        throw new ApiError(400, `${name} is required and must be a non-empty string.`);
    }

    return value.trim();
};

const buildJobData = (body: Record<string, any>) => {
    const skills = Array.isArray(body.skills)
        ? body.skills
            .map(String)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const milestones = Array.isArray(body.milestones)
        ? body.milestones.map((item) => {
            const milestone = item as Record<string, any>;
            return {
                id: String(milestone.id || randomUUID()),
                title: requireText(milestone.title, "Milestone title"),
                description: requireText(milestone.description, "Milestone description"),
                dueDate: requireText(milestone.dueDate, "Milestone due date"),
                budget: Number(milestone.budget),
            };
        })
        : [];

    if (!skills.length) {
        throw new ApiError(400, "At least one skill is required.");
    }

    if (!milestones.length) {
        throw new ApiError(400, "At least one milestone is required.");
    }

    if (milestones.some(({ budget }) => !Number.isFinite(budget) || budget <= 5)) {
        throw new ApiError(400, "All milestones must have a valid budget greater than 5.");
    }

    const dates = milestones.map(({ dueDate }) => new Date(dueDate).getTime());

    if (dates.some(
        (date, index) => !Number.isFinite(date) || date <= Date.now() || (index > 0 && date <= dates[index - 1]!),
    )) {
        throw new ApiError(400, "All milestones must have valid due dates in the future and in chronological order.");
    }

    const total_budget = milestones.reduce((total, item) => total + item.budget, 0);

    if (total_budget < 5 || total_budget > 1_000_00) {
        throw new ApiError(400, "Total budget must be between 5 and 100,000.");
    }

    const attachments = Array.isArray(body.attachments) ? body.attachments.map((item) => {
        const attachment = item as Record<string, string>;
        const fileType = requireText(attachment.fileType, "Attachment file type");
        const fileUrl = requireText(attachment.fileUrl, "Attachment file URL");

        if (fileType !== 'application/pdf' && !fileType.startsWith('image/')) {
            throw new ApiError(400, "Attachment file type must be either PDF or an image.");
        }

        if (fileUrl.startsWith('data:') && !fileUrl.startsWith(`data:${fileType};base64,`)) {
            throw new ApiError(400, "Attachment file URL must be a valid base64 data URL matching the specified file type.");
        }

        return {
            fileId: typeof attachment.fileId === "string" ? attachment.fileId : "",
            fileName: requireText(attachment.fileName, "Attachment file name"),
            fileUrl,
            fileType,
            fileSize: Number(attachment.fileSize) || 0,
        }
    }) : [];

    return {
        title: requireText(body.title, "Job title"),
        description: requireText(body.description, "Job description"),
        expertise_level: requireText(body.expertise_level, "Expertise level"),
        skills,
        total_budget: total_budget.toString(),
        milestones,
        screening_questions: Array.isArray(body.screening_questions)
            ? body.screening_questions
                .map(String)
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        attachments: Array.isArray(body.attachments) ? body.attachments : [],
        status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    };
};


export const createClientJobPost: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireClient(request);
    const data = buildJobData(request.body as Record<string, any>);
    const job = await createJobPost(auth.userId, {
        ...data,
        published_At: data.status === "PUBLISHED" ? new Date() : null,
    });
    response.status(201).json({
        success: true,
        message: "Job post created successfully.",
        data: job,
    });
});

export const getClientJobPosts: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireClient(request);
    const jobId = typeof request.params.jobId === "string" ? request.params.jobId : undefined;
    const jobs = await getJobPosts(auth.userId, jobId);

    response.status(200).json({
        success: true,
        message: "Job posts retrieved successfully.",
        data: jobId ? (jobs[0] || null) : jobs,
    });
});

export const editClientJobPost: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireClient(request);

    const job = await updateJobPost(
        auth.userId,
        requireText(request.params.jobId, "Job ID"),
        buildJobData(request.body as Record<string, unknown>),
    );

    response.status(200).json({
        success: true,
        message: "Job post updated successfully.",
        data: job,
    });
});

export const removeClientJobPost: RequestHandler = asynchandler(async (request, response) => {
    const auth = requireClient(request);

    await updateJobPost(
        auth.userId,
        requireText(request.params.jobId, "Job ID"),
        { status: "DELETED" },
    );

    response.status(200).json({
        success: true,
        message: "Job post removed successfully.",
    });
});