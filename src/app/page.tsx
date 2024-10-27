import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ConvexHttpClient } from "convex/browser";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "../../convex/_generated/api";
import Loading from "./loading";

export default async function Home() {

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const courses = await convex.query(api.courses.getCourses)

  return (
    <div className="  flex flex-col justify-center min-h-screen">
      <main className=" flex-grow justify-center container mx-auto px-4 py-16 ">

        {/* HEADING */}
        <div className=" text-center mb-16">
          <h1 className=" text-2xl md:text-4xl font-bold mb-4">Forge Your Path in Modern Development</h1>
          <p className=' text-gray-500 text-sm md:text-lg font-medium max-w-2xl mx-auto'>Master fullstack skills through engaging, project-bases learning. Unlock your potential with Masterclass</p>
        </div>

        {/* COURSES */}
        {!courses && <Loading /> }

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {courses.slice(0, 3).map(course => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>

        <div className=" w-full flex justify-center items-center">
          <Link href={'/pro'} className=" group mx-auto ">
            <Button variant={'primary'}>
              Explore Pro Plans
              <ArrowRight size={20} className="animate-move-x group-hover:translate-x-2" />
            </Button>
          </Link>

        </div>
      </main>
    </div>
  );
}
