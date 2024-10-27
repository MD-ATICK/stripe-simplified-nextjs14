import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import stripe from "@/lib/stripe";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface props {
    params: { courseId: string };
    searchParams: { session_id: string }
}

const page = async ({ params, searchParams }: props) => {
    const { courseId } = params;
    const { session_id } = searchParams;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session === undefined) {
            return <Loading />
        }

        if (!session || session.payment_status === "unpaid") {
            return (
                <div className=" font-medium w-full p-4 text-center text-sm ">
                    Incorrect session!
                </div>
            )
        }

        if (session && session.payment_status === "paid") {
            return (
                <div className='container mx-auto py-12 px-4'>
                    <Card className='max-w-2xl p-4 shadow-lg mx-auto'>
                        <CardHeader className='text-center'>
                            <CheckCircle className='size-16 text-green-500 mx-auto mb-4' />
                            <CardTitle className='text-3xl font-bold text-green-700'>Purchase Successful!</CardTitle>
                        </CardHeader>

                        <CardContent className='text-center space-y-6'>
                            <p className='text-xl text-gray-600'>
                                Thank you for enrolling our course. Your journey to new skills and knowledge begins now!
                            </p>

                            <div className='bg-gray-100 p-4 rounded-md'>
                                <p className='text-sm text-gray-500 font-medium'>Transaction ID: {session_id}</p>
                            </div>
                            <div className='flex justify-center gap-4'>
                                <Link href={`/courses/${courseId}`}>
                                    <Button className='w-full sm:w-auto flex items-center justify-center'>Go to Course</Button>
                                </Link>
                                <Link href='/courses'>
                                    <Button variant='outline' className='w-full sm:w-auto'>
                                        Browse More Courses
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    } catch (error) {
        return <p className=" p-2 text-sm text-center font-medium w-full">{(error as Error).message}</p>
    }




};
export default page;