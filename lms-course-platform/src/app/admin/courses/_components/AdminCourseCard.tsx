import { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
    ArrowRight,
    Eye,
    MoreVertical,
    Pencil,
    School,
    TimerIcon,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdminCourseCardProps {
    data: AdminCourseType;
}

export default function AdminCourseCard({
    data,
}: AdminCourseCardProps) {
    const thumbnailUrl = useConstructUrl(data.fileKey);

    return (
        <Card className="relative gap-0 py-0 group">
            {/* Absolute Dropdown */}
            <div className="absolute z-10 top-2 right-2">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="secondary"
                                size="icon"
                            >
                                <MoreVertical className="size-4" />
                            </Button>
                        }
                    />

                    <DropdownMenuContent
                        align="end"
                        className="w-48"
                    >
                        <DropdownMenuItem
                            render={
                                <Link
                                    href={`/admin/courses/${data.id}/edit`}
                                >
                                    <Pencil className="mr-2 size-4" />
                                    Edit Course
                                </Link>
                            }
                        />

                        <DropdownMenuItem
                            render={
                                <Link
                                    href={`/courses/${data.slug}`}
                                >
                                    <Eye className="mr-2 size-4" />
                                    Preview
                                </Link>
                            }
                        />

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            render={
                                <Link
                                    href={`/admin/courses/${data.id}/delete`}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Course
                                </Link>
                            }
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Image
                src={thumbnailUrl}
                alt={data.title}
                width={600}
                height={400}
                className="object-cover w-full h-full rounded-t-lg aspect-video"
            />

            <CardContent className="p-4">
                <Link
                    href={`/admin/courses/${data.id}`}
                    className="text-lg font-medium transition-colors line-clamp-2 hover:underline group-hover:text-primary"
                >
                    {data.title}
                </Link>

                <p className="text-sm line-clamp-2 text-muted-foreground">
                    {data.smallDescription}
                </p>

                <div className="flex items-center mt-4 gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <TimerIcon className="p-1 rounded-md size-6 text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">
                            {data.duration}
                        </p>
                    </div>

                    <div className="flex items-center gap-x-2">
                        <School className="p-1 rounded-md size-6 text-primary bg-primary/10" />
                        <p className="text-sm text-muted-foreground">
                            {data.level}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/admin/courses/${data.id}/edit`}
                    className={buttonVariants({
                        className: "w-full mt-4",
                    })}
                >
                    Edit Course
                    <ArrowRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}

export function AdminCourseCardSkeleton() {
    return (
        <Card className="relative gap-0 py-0 group">
            <div className="absolute z-10 flex items-center top-2 right-2">
                <Skeleton className="w-16 h-8 rounded-full" />
                <Skeleton className="rounded-md size-8" />
            </div>

            <div className="relative w-full h-fit">
                <Skeleton className="w-full rounded-t-lg aspect-video h-62.5 object-cover" />
            </div>
            <CardContent className="p-4">
                <Skeleton className="w-3/4 h-6 mb-2 rounded" />
                <Skeleton className="w-full h-4 mb-4 rounded" />
                <div className="flex items-center mt-4 gap-x-5">
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="rounded-md size-6" />
                        <Skeleton className="w-10 h-4 rounded" />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="rounded-md size-6" />
                        <Skeleton className="w-10 h-4 rounded" />
                    </div>
                </div>
                <Skeleton className="w-full h-10 mt-4 rounded" />
            </CardContent>
        </Card>
    );
}