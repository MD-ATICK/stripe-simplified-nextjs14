
import CourseCard from "@/components/CourseCard";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import Loading from "../loading";
export default async function page() {

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const courses = await convex.query(api.courses.getCourses)
    return (
        <div className="  flex flex-col justify-center min-h-screen">
            <main className=" flex-grow justify-center container mx-auto px-4 py-6 ">

                {/* HEADING */}
                <div className=" text-center mb-8">
                    <h1 className=" text-4xl font-bold mb-4">All Courses</h1>
                </div>

                {/* COURSES */}
                {!courses && <Loading />}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            </main>
        </div>
    )
}
