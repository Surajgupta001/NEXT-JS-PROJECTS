"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DraggableSyntheticListeners, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode, useState } from "react";
import { AdminGetCourseSingularType } from "@/app/data/admin/admin-get-course";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { reorderChapters, reorderLessons } from "../action";
import NewChapterModal from "./NewChapterModal";
import NewLessonModal from "./NewLessonModal";
import DeleteLesson from "./DeleteLesson";
import DeleteChapter from "./DeleteChapter";

interface SortableItemProps {
    id: string;
    children: (listeners: DraggableSyntheticListeners) => ReactNode;
    className?: string;
    data?: {
        type: "chapter" | "lesson";
        chapterId?: string;
    };
}

interface CourseStructureProps {
    data: AdminGetCourseSingularType;
}

export default function CourseStructure({ data }: CourseStructureProps) {
    const initialItems = data.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        order: chapter.position,
        isOpen: false,
        lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
        })),
    }));

    const [items, setItems] = useState(initialItems);

    function SortableItem({ id, data, children, className }: SortableItemProps) {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                className={cn(
                    "touch-none",
                    className,
                    isDragging && "z-10 opacity-50"
                )}
            >
                {children(listeners)}
            </div>
        );
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeId = active.id;
        const overId = over.id;

        const activeType = active.data.current?.type as "chapter" | "lesson";
        const overType = over.data.current?.type as "chapter" | "lesson";

        const courseId = data.id;

        if (activeType === "chapter") {
            let targetChapterId = null;

            if (overType === 'chapter') {
                targetChapterId = over.id;
            } else if (overType === 'lesson') {
                targetChapterId = over.data.current?.chapterId ?? null;
            }

            if (!targetChapterId) {
                toast.error("Cannot move chapter to this position.");
                return;
            }

            const oldIndex = items.findIndex((chapter) => chapter.id === activeId);
            const newIndex = items.findIndex((chapter) => chapter.id === targetChapterId);

            if (oldIndex === -1 || newIndex === -1) {
                toast.error("Error occurred while moving chapter.");
                return;
            }

            const reorderedLocalChapter = arrayMove(items, oldIndex, newIndex);

            const updatedChapterForStates = reorderedLocalChapter.map((chapter, index) => ({
                ...chapter,
                order: index + 1,
            }));

            const previousItems = [...items];

            setItems(updatedChapterForStates);

            if (courseId) {
                const chaptersToUpdate = updatedChapterForStates.map((chapter) => ({
                    id: chapter.id,
                    position: chapter.order,
                }));

                const reorderChaptersPromise = () => reorderChapters(courseId, chaptersToUpdate);

                toast.promise(reorderChaptersPromise(), {
                    loading: "Reordering chapters...",
                    success: (result) => {
                        if (result.success) return result.message;
                        throw new Error(result.message);
                    },
                    error: () => {
                        setItems(previousItems);
                        return "Failed to reorder chapters. Please try again later.";
                    }
                });
            }

            return;
        }

        if (activeType === "lesson" && overType === "lesson") {
            const chapterId = active.data.current?.chapterId;
            const overChapterId = over.data.current?.chapterId;

            if (!chapterId || chapterId !== overChapterId) {
                toast.error("Cannot move lesson to this position.");
                return;
            }

            const chapterIndex = items.findIndex((chapter) => chapter.id === chapterId);
            if (chapterIndex === -1) {
                toast.error("Error occurred while moving lesson.");
                return;
            }

            const chapterToUpdate = items[chapterIndex];

            const oldLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === activeId);
            const newLessonIndex = chapterToUpdate.lessons.findIndex((lesson) => lesson.id === overId);

            if (oldLessonIndex === -1 || newLessonIndex === -1) {
                toast.error("Error occurred while moving lesson.");
                return;
            }

            const reorderedLocalLessons = arrayMove(chapterToUpdate.lessons, oldLessonIndex, newLessonIndex);

            const updatedLessonsForStates = reorderedLocalLessons.map((lesson, index) => ({
                ...lesson,
                order: index + 1,
            }));

            const newItems = [...items];

            newItems[chapterIndex] = {
                ...chapterToUpdate,
                lessons: updatedLessonsForStates,
            };

            const previousItems = [...items];

            setItems(newItems);

            if (courseId) {
                const lessonsToUpdate = updatedLessonsForStates.map((lesson) => ({
                    id: lesson.id,
                    position: lesson.order,
                }));

                const reorderLessonsPromise = () => reorderLessons(courseId, lessonsToUpdate, chapterId);

                toast.promise(reorderLessonsPromise(), {
                    loading: "Reordering lessons...",
                    success: (result) => {
                        if (result.success) return result.message;
                        throw new Error(result.message);
                    },
                    error: () => {
                        setItems(previousItems);
                        return "Failed to reorder lessons. Please try again later.";
                    }
                });
            }

            return;
        }
    }

    function toggleChapter(chapterId: string) {
        setItems((chapter) =>
            chapter.map((chapter) => {
                if (chapter.id === chapterId) {
                    return {
                        ...chapter,
                        isOpen: !chapter.isOpen,
                    };
                }

                return chapter;
            })
        );
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                    <CardTitle>Chapters</CardTitle>
                    <NewChapterModal courseId={data.id} />
                </CardHeader>

                <CardContent>
                    <SortableContext
                        items={items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((item) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                data={{
                                    type: "chapter",
                                }}
                            >
                                {(listeners) => (
                                    <Card className="mb-3">
                                        <Collapsible
                                            open={item.isOpen}
                                            onOpenChange={() => toggleChapter(item.id)}
                                        >
                                            {/* CHAPTER HEADER */}
                                            <div className="flex items-center justify-between p-3 border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    {/* Chapter drag handle */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="cursor-grab"
                                                        {...listeners}
                                                    >
                                                        <GripVertical className="size-4" />
                                                    </Button>

                                                    {/* Open / close */}
                                                    <CollapsibleTrigger
                                                        render={
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                {item.isOpen ? (
                                                                    <ChevronDown className="size-4" />
                                                                ) : (
                                                                    <ChevronRight className="size-4" />
                                                                )}
                                                            </Button>
                                                        }
                                                    />

                                                    <p className="font-medium">{item.title}</p>
                                                </div>

                                                <DeleteChapter chapterId={item.id} courseId={data.id} />
                                            </div>

                                            {/* LESSONS */}
                                            <CollapsibleContent>
                                                <div className="p-1">
                                                    <SortableContext
                                                        items={item.lessons.map((lesson) => lesson.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {item.lessons.map((lesson) => (
                                                            <SortableItem
                                                                key={lesson.id}
                                                                id={lesson.id}
                                                                data={{
                                                                    type: "lesson",
                                                                    chapterId: item.id,
                                                                }}
                                                            >
                                                                {(lessonListeners) => (
                                                                    <div className="flex items-center justify-between p-2 rounded-sm hover:bg-accent">
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="cursor-grab"
                                                                                {...lessonListeners}
                                                                            >
                                                                                <GripVertical className="size-4" />
                                                                            </Button>

                                                                            <FileText className="size-4" />

                                                                            <Link
                                                                                href={`/admin/courses/${data.id}/edit/chapters/${item.id}/lessons/${lesson.id}`}
                                                                                className="hover:text-primary"
                                                                            >
                                                                                {lesson.title}
                                                                            </Link>
                                                                        </div>

                                                                        <DeleteLesson chapterId={item.id} lessonId={lesson.id} courseId={data.id} />
                                                                    </div>
                                                                )}
                                                            </SortableItem>
                                                        ))}
                                                    </SortableContext>

                                                    {/* CREATE LESSON */}
                                                    <div className="p-2">
                                                        <NewLessonModal courseId={data.id} chapterId={item.id} />
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                )}
                            </SortableItem>
                        ))}
                    </SortableContext>
                </CardContent>
            </Card>
        </DndContext>
    );
}