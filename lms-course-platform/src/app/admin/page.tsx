import { ChartAreaInteractive } from "@/components/sidebar-ui/chart-area-interactive";
import { SectionCards } from "@/components/sidebar-ui/section-cards";
import { adminGetEnrollmentStats } from "../data/admin/admin-get-enrollment-stats";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { adminGetRecentCourses } from "../data/admin/admin-get-recent-courses";
import EmptyState from "@/components/general/EmptyState";
import AdminCourseCard, { AdminCourseCardSkeleton } from "./courses/_components/AdminCourseCard";
import { Suspense } from "react";

export default async function AdminIndexPage() {

  const enrollmentData = await adminGetEnrollmentStats();

  return (
    <>
      <SectionCards />
      <ChartAreaInteractive data={enrollmentData} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Enrollments</h2>
          <Link
            href="/admin/courses"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View All Courses
          </Link>
        </div>
        <Suspense fallback={<RenderRecentCoursesSkeletonLayout />}>
          <RenderRecentCourses />
        </Suspense>
      </div>
    </>
  );
}


async function RenderRecentCourses() {
  const data = await adminGetRecentCourses();

  if (data.length === 0) {
    return (
      <EmptyState
        buttonText="Create new Course"
        description="You don't have any courses. Create some to see them here."
        title="You don't have any courses yet"
        href="/admin/courses/create"
      />
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {data.map((course) => (
        <AdminCourseCard key={course.id} data={course} />
      ))}
    </div>
  )
};


function RenderRecentCoursesSkeletonLayout() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {Array.from({ length: 2 }).map((_, index) => (
        <AdminCourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
