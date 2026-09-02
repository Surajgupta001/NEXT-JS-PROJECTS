"use client";

import { AdminGetLessonType } from "@/app/data/admin/admin-get-lesson";
import Uploader from "@/components/file-uploader/Uploader";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { lessonSchema, LessonSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { updateLesson } from "../action";
import { toast } from "sonner";

interface LessonFormProps {
    data: AdminGetLessonType;
    chapterId: string;
    courseId: string;
}

export default function LessonFormPage({ data, chapterId, courseId }: LessonFormProps) {

    const [pending, startTransition] = useTransition();

    const form = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            name: data.title,
            chapterId: chapterId,
            courseId: courseId,
            description: data.description ?? "",
            videoKey: data.videoKey ?? "",
            thumbnailKey: data.thumbnailKey ?? "",
        },
    });

    async function onSubmit(values: LessonSchema) {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(updateLesson(values, data.id));

            if (error) {
                toast.error("An error occurred while updating the lesson");
                return;
            }

            if (result.status === "success") {
                toast.success(result.message);
            } else if (result.status === "error") {
                toast.error(result.message);
            }
        })
    };

    return (
        <div>
            <Link
                className={buttonVariants({
                    variant: "outline",
                    className: "mb-6",
                })}
                href={`/admin/courses/${courseId}/edit`}
            >
                <ArrowLeft className="size-4" />
                <span>Go Back</span>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Lesson Configuration</CardTitle>
                    <CardDescription>
                        Configure the video and description for this lesson.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <Field>
                            <FieldLabel>Lesson Name</FieldLabel>

                            <Input
                                placeholder="Lesson Name"
                                {...form.register("name")}
                            />

                            {form.formState.errors.name && (
                                <FieldError>
                                    {form.formState.errors.name.message}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Lesson Description</FieldLabel>

                            <Controller
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <RichTextEditor
                                        field={{
                                            value: field.value ?? "",
                                            onChange: field.onChange,
                                        }}
                                    />
                                )}
                            />

                            {form.formState.errors.description && (
                                <FieldError>
                                    {form.formState.errors.description.message}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Lesson Thumbnail</FieldLabel>

                            <Controller
                                control={form.control}
                                name="thumbnailKey"
                                render={({ field }) => (
                                    <Uploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        fileTypeAccepted="image"
                                    />
                                )}
                            />

                            {form.formState.errors.thumbnailKey && (
                                <FieldError>
                                    {form.formState.errors.thumbnailKey.message}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Lesson Video File</FieldLabel>

                            <Controller
                                control={form.control}
                                name="videoKey"
                                render={({ field }) => (
                                    <Uploader
                                        value={field.value}
                                        onChange={field.onChange}
                                        fileTypeAccepted="video"
                                    />
                                )}
                            />

                            {form.formState.errors.videoKey && (
                                <FieldError>
                                    {form.formState.errors.videoKey.message}
                                </FieldError>
                            )}
                        </Field>

                        <Button
                            type="submit"
                            disabled={pending}

                        >
                            {pending ? 'Updating...' : 'Update Lesson'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}