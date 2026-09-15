import { getAllCourses } from '../data/course/get-all-courses'
import { getEnrolledCourses } from '../data/user/get-enrolled-courses'
import EmptyState from '@/components/general/EmptyState';
import PublicCourseCard from '../(public)/_components/PublicCourseCard';
import Link from 'next/link';
import CourseProgressCard from './_components/CourseProgressCard';

export default async function DashboardPage() {

  const [{ courses }, enrolledCourses] = await Promise.all([getAllCourses({ pageSize: 6 }), getEnrolledCourses()]);

  return (
    <>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold'>Enrolled Courses</h1>
        <p className='text-muted-foreground'>Here you can see all the courses you are enrolled in.</p>
      </div>
      {enrolledCourses.length === 0 ? (
        <EmptyState
          title='No Course Purchased'
          description='You have not purchased any courses yet. Browse our catalog and enroll in a course to get started.'
          buttonText='Browse Courses'
          href='/courses'
        />
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {enrolledCourses.map((course) => (
            <CourseProgressCard key={course.course.id} data={course} />
          ))}
        </div>
      )}

      <section className='mt-10'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-bold'>Available Courses</h1>
          <p className='text-muted-foreground'>Here you can see all the courses that are available for course.</p>
        </div>

        {courses.filter(
          (course) =>
            !enrolledCourses.some(
              ({ course: enrolled }) => enrolled.id === course.id
            )
        ).length === 0 ? (
          <EmptyState
            title='No Courses Available'
            description='There are no courses available for enrollment at the moment. Please check back later.'
            buttonText='Browse Courses'
            href='/courses'
          />
        ) : (
          <div className='grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3'>
            {courses.filter(
              (course) =>
                !enrolledCourses.some(
                  ({ course: enrolled }) => enrolled.id === course.id
                )
            ).map((course) => (
              <PublicCourseCard key={course.id} data={course} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
