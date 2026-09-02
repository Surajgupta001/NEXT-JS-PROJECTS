"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import slugify from "slugify";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseCategories, courseLevels, courseSchema, courseStatus, CourseFormValues, CourseSchema } from "@/lib/zodSchema";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import Uploader from "@/components/file-uploader/Uploader";
import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { createCourse } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfetti } from "@/hooks/use-confetti";

export default function CourseCreationPage() {

    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const {} = useConfetti();
    const { triggerConfetti } = useConfetti();

    const form = useForm<CourseFormValues, unknown, CourseSchema>({
        resolver: zodResolver(courseSchema),

        defaultValues: {
            title: "",
            description: "",
            fileKey: "",
            price: 0,
            duration: 0,
            level: "BEGINNER",
            category: "Development",
            status: "DRAFT",
            slug: "",
            smallDescription: "",
        },
    });

    function onSubmit(values: CourseSchema) {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(createCourse(values))

            if (error) {
                console.error("Error creating course:", error);
                return;
            }

            if (result.status === 'success') {
                toast.success(result.message);
                triggerConfetti();
                form.reset();
                router.push("/admin/courses");
                form.reset();
            } else {
                toast.error(result.message);
            }
        });
    }

    function generateSlug() {
        const titleValue = form.getValues("title");

        const slug = slugify(titleValue, {
            lower: true,
            strict: true,
            trim: true,
        });

        form.setValue("slug", slug, {
            shouldValidate: true,
            shouldDirty: true,
        });
    }

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/courses" className={buttonVariants({ variant: "outline", size: "icon", })}>
                    <ArrowLeft className="size-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Course</h1>
                    <p className="text-sm text-muted-foreground">Create and configure your new course.</p>
                </div>
            </div>

            {/* Course Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Provide the basic information about your course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>

                        {/* Course Title */}
                        <Field>
                            <FieldLabel htmlFor="title">Course Title</FieldLabel>
                            <Input
                                id="title"
                                placeholder="e.g. Complete Next.js Course"
                                {...form.register("title")}
                            />
                            {form.formState.errors.title && (
                                <FieldError>
                                    {form.formState.errors.title.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* Slug */}
                        <Field>
                            <FieldLabel htmlFor="slug">Course Slug</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="slug"
                                    placeholder="e.g. complete-nextjs-course"
                                    {...form.register("slug")}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateSlug}
                                    className="shrink-0"
                                >
                                    <SparkleIcon className="size-4" />
                                    Generate
                                </Button>
                            </div>
                            {form.formState.errors.slug && (
                                <FieldError>
                                    {form.formState.errors.slug.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* Short Description */}
                        <Field>
                            <FieldLabel htmlFor="smallDescription">Short Description</FieldLabel>
                            <Input
                                id="smallDescription"
                                placeholder="A short summary of your course"
                                {...form.register("smallDescription")}
                            />
                            {form.formState.errors.smallDescription && (
                                <FieldError>
                                    {form.formState.errors.smallDescription.message}
                                </FieldError>
                            )}
                        </Field>

                        {/* Description */}
                        <Field>
                            <FieldLabel htmlFor="description">
                                Course Description
                            </FieldLabel>

                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <RichTextEditor field={field} />

                                        {fieldState.error && (
                                            <FieldError>
                                                {fieldState.error.message}
                                            </FieldError>
                                        )}
                                    </>
                                )}
                            />
                        </Field>

                        {/* Category + Level */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Category */}
                            <Field>
                                <FieldLabel htmlFor="category">Category</FieldLabel>
                                <Controller
                                    name="category"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="category" className="w-full">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courseCategories.map(
                                                        (category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && (
                                                <FieldError>
                                                    {fieldState.error.message}
                                                </FieldError>
                                            )}
                                        </>
                                    )}
                                />
                            </Field>

                            {/* Level */}
                            <Field>
                                <FieldLabel htmlFor="level">Course Level</FieldLabel>
                                <Controller
                                    name="level"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="level" className="w-full">
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courseLevels.map(
                                                        (level) => (
                                                            <SelectItem key={level} value={level}>
                                                                {level}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && (
                                                <FieldError>
                                                    {fieldState.error.message}
                                                </FieldError>
                                            )}
                                        </>
                                    )}
                                />
                            </Field>
                        </div>

                        {/* Price + Duration */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Price */}
                            <Field>
                                <FieldLabel htmlFor="price">Price ($)</FieldLabel>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 999"
                                    {...form.register("price", {
                                        valueAsNumber: true,
                                    })}
                                />

                                {form.formState.errors.price && (
                                    <FieldError>
                                        {form.formState.errors.price.message}
                                    </FieldError>
                                )}
                            </Field>

                            {/* Duration */}
                            <Field>
                                <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="500"
                                    placeholder="e.g. 120"
                                    {...form.register("duration", {
                                        valueAsNumber: true,
                                    })}
                                />

                                {form.formState.errors.duration && (
                                    <FieldError>
                                        {form.formState.errors.duration.message}
                                    </FieldError>
                                )}
                            </Field>
                        </div>

                        {/* Thumbnail Image */}
                        <Field>
                            <FieldLabel htmlFor="fileKey">
                                Course Thumbnail
                            </FieldLabel>
                            <Controller
                                name="fileKey"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Uploader
                                            value={field.value}
                                            onChange={field.onChange}
                                            fileTypeAccepted="image"
                                        />

                                        {fieldState.error && (
                                            <FieldError>
                                                {fieldState.error.message}
                                            </FieldError>
                                        )}
                                    </>
                                )}
                            />
                        </Field>

                        {/* Status */}
                        <Field>
                            <FieldLabel htmlFor="status">Course Status</FieldLabel>
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="status" className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courseStatus.map(
                                                    (status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && (
                                            <FieldError>
                                                {fieldState.error.message}
                                            </FieldError>
                                        )}
                                    </>
                                )}
                            />
                        </Field>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                                disabled={pending}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending}
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="ml-1 size-4 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="ml-1 cursor-pointer size-4" /> Create Course
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}