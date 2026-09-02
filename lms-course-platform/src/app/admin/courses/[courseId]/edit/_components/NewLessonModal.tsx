import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { lessonSchema, LessonSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { createLesson } from "../action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

export default function NewLessonModal({ courseId, chapterId }: { courseId: string, chapterId: string }) {

    const [isOpen, setIsOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const form = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            name: '',
            courseId: courseId,
            chapterId: chapterId,
        }
    });

    async function onSubmit(values: LessonSchema) {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(createLesson(values))

            if (error) {
                toast.error("Failed to create lesson. Please try again later.");
                return;
            }

            if (result.status === 'success') {
                toast.success(result.message);
                form.reset();
                setIsOpen(false);
            } else if (result.status === 'error') {
                toast.error(result.message);
            }

        })
    };

    function handleOpenChange(open: boolean) {
        setIsOpen(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button className="justify-center w-full gap-1">
                        <Plus className="size-4" /> New Lesson
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Create New Lesson</DialogTitle>
                    <DialogDescription>
                        What would you like to name your lesson?
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-8"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <Field>
                        <FieldLabel>Title</FieldLabel>
                        <Input
                            placeholder="Chapter Title"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <FieldError>
                                {form.formState.errors.name.message}
                            </FieldError>
                        )}
                    </Field>
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>
                            {pending ? "Creating...." : "Create Lesson"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
