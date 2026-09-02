import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { chapterSchema, ChapterSchema } from '@/lib/zodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form';
import { createChapter } from '../action';
import { tryCatch } from '@/hooks/try-catch';
import { toast } from 'sonner';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function NewChapterModal({ courseId }: { courseId: string }) {

    const [isOpen, setIsOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    const form = useForm<ChapterSchema>({
        resolver: zodResolver(chapterSchema),
        defaultValues: {
            name: '',
            courseId: courseId,
        }
    });

    async function onSubmit(values: ChapterSchema) {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(createChapter(values))

            if (error) {
                toast.error("Failed to create chapter. Please try again later.");
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
                    <Button className="gap-2" variant="outline" size="sm">
                        <Plus className="size-4" /> New Chapter
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Create New Chapter</DialogTitle>
                    <DialogDescription>
                        What would you like to name your chapter?
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
                            {pending ? "Creating...." : "Create Chapter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
