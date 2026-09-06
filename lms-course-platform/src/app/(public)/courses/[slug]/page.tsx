import { getIndividualCourse } from "@/app/data/course/get-all-course";
import { Badge } from "@/components/ui/badge";
import { useConstructUrl as constructUrl } from "@/hooks/use-construct-url";
import Image from "next/image";
import { IconBook, IconCategory, IconChartBar, IconChevronDown, IconClock, IconPlayerPlay } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export default async function SlugPage({ params }: { params: Params }) {

    const { slug } = await params;
    const course = await getIndividualCourse(slug);

    const thumbnailUrl = constructUrl(course.fileKey);

    return (
        <div className="grid grid-cols-1 gap-8 mt-5 lg:grid-cols-3">
            <div className="order-1 lg:col-span-2">
                <div className="relative w-full overflow-hidden shadow-lg rounded-xl aspect-video">
                    <Image
                        src={thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>
                <div className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
                        <p className="text-lg leading-relaxed text-muted-foreground line-clamp-2">{course.smallDescription}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                    <Badge className="flex items-center gap-1 px-3 py-1">
                        <IconChartBar className="size-4" />
                        <span>{course.level}</span>
                    </Badge>
                    <Badge className="flex items-center gap-1 px-3 py-1">
                        <IconCategory className="size-4" />
                        <span>{course.category}</span>
                    </Badge>
                    <Badge className="flex items-center gap-1 px-3 py-1">
                        <IconClock className="size-4" />
                        <span>{course.duration} hours</span>
                    </Badge>
                </div>
                <Separator className="my-8" />
                <div className="space-y-6">
                    <h2 className="text-3xl font-semibold tracking-tight">Course Description</h2>
                    <div>
                        <RenderDescription json={JSON.parse(course.description)} />
                    </div>
                </div>
                <div className="mt-12 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-semibold tracking-tight">Course Content</h2>
                        <div>
                            {course.chapters.length} Chapters | {' '}
                            {course.chapters.reduce(
                                (total, chapter) => total + chapter.lessons.length, 0
                            ) || 0} Lessons
                        </div>
                    </div>
                    <div className="space-y-4">
                        {course.chapters.map((chapter, index) => (
                            <Collapsible key={chapter.id} defaultOpen={index === 0}>
                                <Card className="gap-0 p-0 overflow-hidden transition-all duration-200 border-2 hover:shadow-md">
                                    <CollapsibleTrigger>
                                        <div>
                                            <CardContent className="p-6 transition-colors hover:bg-muted/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <p className="flex items-center justify-center font-semibold rounded-full size-10 bg-primary/10 text-primary">{index + 1}</p>
                                                        <div>
                                                            <h3 className="text-xl font-semibold text-left">{chapter.title}</h3>
                                                            <p className="mt-1 text-sm text-left text-muted-foreground">
                                                                {chapter.lessons.length} Lesson{chapter.lessons.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant='outline' className="text-xs">
                                                            {chapter.lessons.length} Lesson{chapter.lessons.length !== 1 ? 's' : ''}
                                                        </Badge>
                                                        <IconChevronDown className="size-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="border-t bg-muted/20">
                                            <div className="p-6 pt-4 space-y-3">
                                                {chapter.lessons.map((lesson, lessonIndex) => (
                                                    <div key={lesson.id} className="flex items-center gap-4 p-3 transition-colors rounded-lg hover:bg-accent">
                                                        <div className="flex items-center justify-center border-2 rounded-full size-8 bg-background border-primary/20">
                                                            <IconPlayerPlay className="transition-colors size-4 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{lesson.title}</p>
                                                            <p className="mt-1 text-xs text-muted-foreground">Lesson {lessonIndex + 1}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        ))}
                    </div>
                </div>
            </div>
            {/* Enrollment Card */}
            <div className="order-2 lg:col-span-1">
                <div className="sticky top-20">
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-lg font-medium">Price</span>
                                <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(course.price)}
                                </span>
                            </div>
                            <div className="p-4 mb-6 space-y-3 rounded-lg bg-muted">
                                <h4 className="font-medium">What you&apos;ll learn</h4>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary">
                                            <IconClock className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Course duration</p>
                                            <p className="text-sm text-muted-foreground">{course.duration} hours</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary">
                                            <IconChartBar className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Course level</p>
                                            <p className="text-sm text-muted-foreground">{course.level}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary">
                                            <IconCategory className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Course category</p>
                                            <p className="text-sm text-muted-foreground">{course.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary">
                                            <IconBook className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Total Lessons</p>
                                            <p className="text-sm text-muted-foreground">
                                                {course.chapters.reduce(
                                                    (total, chapter) => total + chapter.lessons.length, 0
                                                ) || 0} Lessons
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-6 space-y-3">
                                <h4>This Course Includes:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm">
                                        <div className="p-1 text-green-500 rounded-full bg-green-500/10">
                                            <CheckIcon className="size-4" />
                                        </div>
                                        <span>Access to all course materials</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <div className="p-1 text-green-500 rounded-full bg-green-500/10">
                                            <CheckIcon className="size-4" />
                                        </div>
                                        <span>Access on mobile and desktop</span>
                                    </li>
                                    <li className="flex items-center gap-2 text-sm">
                                        <div className="p-1 text-green-500 rounded-full bg-green-500/10">
                                            <CheckIcon className="size-4" />
                                        </div>
                                        <span>Certificate of completion</span>
                                    </li>
                                </ul>
                            </div>
                            <Button className="w-full">Enroll Now</Button>
                            <p className="mt-3 text-xs text-center text-muted-foreground">
                                By enrolling in this course, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
