import Loading from "@/app/loading"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Id } from "../../convex/_generated/dataModel"
import PurchaseButton from "./PurchaseButton"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

interface props {
    course: {
        _id: Id<'courses'>,
        title: string,
        imageUrl: string,
        description: string,
        price: number
    }
}
export default function CourseCard({ course }: props) {
    return (
        <Card className=" fle flex-col bg-white backdrop-blur-xl ">
            <Link href={`/courses/${course._id}`} className=" cursor-pointer">
                <CardHeader>
                    <div className=" w-full aspect-[16/10] relative">
                        <Image src={course.imageUrl} alt="" fill sizes="400px" className=" rounded-xl object-cover" />
                    </div>
                </CardHeader>
                <CardContent className=" flex-grow">
                    <CardTitle className=" text-xl font-bold mb-2 hover:underline">
                        {course.title}
                    </CardTitle>
                </CardContent>
                <CardFooter className=" flex justify-between items-center">
                    <Badge variant={'default'} className=" text-lg px-3 py-1">
                        ${course.price.toFixed(2)}
                    </Badge>
                    <Suspense fallback={<Loading />}>
                        <PurchaseButton courseId={course._id} />
                    </Suspense>
                </CardFooter>
            </Link>
        </Card>
    )
}
