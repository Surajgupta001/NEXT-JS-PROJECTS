import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import AdminCourseCard from "./_components/AdminCourseCard";
import EmptyState from "@/components/general/EmptyState";

export default async function CoursesPage() {

    const data = await adminGetCourses();

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Your Courses</h1>
                <Link href="/admin/courses/create" className={buttonVariants()}>
                    Create Course
                </Link>
            </div>
            {data.length === 0 ? (
                <EmptyState
                    title="No Courses Found"
                    description="You haven't created any courses yet. Create your first course to get started."
                    buttonText="Create Course"
                    href="/admin/courses/create"
                />
            ) : (
                <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3">
                    {data.map((course) => (
                        <AdminCourseCard key={course.id} data={course} />
                    ))}
                </div>
            )}
        </>
    )
}
