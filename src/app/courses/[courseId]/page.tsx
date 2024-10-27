"use client"

import PurchaseButton from "@/components/PurchaseButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { Download, FileText, FileTextIcon, Lock, PlayCircle } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import CourseDetailSkeleton from "./CourseDetalisSkeleton"

interface props {
    params: { courseId: Id<'courses'> }
}
export default function Page({ params: { courseId } }: props) {

    const { user, isLoaded: isUserLoaded } = useUser()

    const userData = useQuery(api.users.getUserByClerkId, { clerkId: user?.id ?? "" })
    const courseData = useQuery(api.courses.getCourseById, { courseId: courseId })
    const userAccess = useQuery(api.users.getUserAccess, userData ? {
        userId: userData._id,
        courseId: courseId
    } : 'skip') || { hasAccess: false }

    if (!isUserLoaded || courseData === undefined) {
        return <CourseDetailSkeleton />
    }

    if (courseData === null) return notFound()

    return (
        <div className=" container mx-auto py-8 px-4">
            <Card className=" max-w-3xl  mx-auto">
                <CardHeader>
                    <div className=" w-full aspect-[16/8] relative ">
                        <Image src={courseData.imageUrl} alt={courseData.title} fill sizes="400px" className=" object-cover rounded-2xl shadow-lg" />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className=" text-3xl font-bold mb-3">
                        {courseData.title}
                    </CardTitle>

                    {/* COURSE ACCESS NOT ACCESS VALIDATION  */}
                    {userAccess.hasAccess ? (
                        <>
                            <p className='text-gray-600 mb-6'>{courseData.description}</p>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                                <Button className='flex items-center justify-center space-x-2'>
                                    <PlayCircle className='w-5 h-5' />
                                    <span>Start Course</span>
                                </Button>
                                <Button variant='outline' className='flex items-center justify-center space-x-2'>
                                    <Download className='w-5 h-5' />
                                    <span>Download Materials</span>
                                </Button>
                            </div>
                            <h3 className='text-xl font-semibold mb-4'>Course Modules</h3>
                            <ul className='space-y-2'>
                                <li className='flex items-center space-x-2'>
                                    <FileTextIcon className='size-5 text-gray-400' />
                                    <span>Introduction to Advanced Patterns</span>
                                </li>
                                <li className='flex items-center space-x-2'>
                                    <FileText className='w-5 h-5 text-gray-400' />
                                    <span>Hooks and Custom Hooks</span>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <div className='text-center font-medium py-6'>
							<div className='flex flex-col items-center space-y-4'>
								<Lock className='w-16 h-16 text-gray-400' />
								<p className='text-lg text-gray-600'>This course is locked.</p>
								<p className='text-gray-500 mb-4'>
									Enroll in this course to access all premium content.
								</p>
								<p className='text-2xl font-bold mb-4'>${courseData.price.toFixed(2)}</p>
								<PurchaseButton courseId={courseId} />
							</div>
						</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
