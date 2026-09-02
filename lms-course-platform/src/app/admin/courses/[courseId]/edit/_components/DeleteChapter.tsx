import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button';
import { tryCatch } from '@/hooks/try-catch';
import { Trash2 } from 'lucide-react';
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner';
import { deleteChapter } from '../action';

export default function DeleteChapter({ chapterId, courseId }: { chapterId: string, courseId: string }) {

    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);
    };

    async function onSubmit() {
        startTransition(async () => {
            const { data: result, error } = await tryCatch(deleteChapter({ chapterId, courseId }))

            if (error) {
                toast.error("Failed to delete chapter. Please try again later.");
                return;
            }

            if (result.status === 'success') {
                toast.success(result.message);
                setOpen(false);
            } else if (result.status === 'error') {
                toast.error(result.message);
            }
        })
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger
                render={
                    <Button variant='ghost' size='icon'>
                        <Trash2 className='size-4' />
                    </Button>
                }
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {' '}
                        This action cannot be undone. This will permanently delete the chapter and remove it from your course.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={onSubmit} disabled={pending}>
                        {pending ? "Deleting..." : "Continue"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
