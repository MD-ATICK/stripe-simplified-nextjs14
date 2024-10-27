"use client";

import Loading from "@/app/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import stripe from "@/lib/stripe";
import { Check, Clock, Rocket, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planType = searchParams.get("planType") as "month" | "year" | "day"
    const session_id = searchParams.get("session_id")

    let benefits;

    switch (planType) {
        case "day":
            benefits = [
                "Access to all premium courses for a one day",
                "Priority support",
                "Exclusive daily member events",
                "Early access to new courses and features",
            ]
            break;
        case "year":
            benefits = [
                "Access to all premium courses for a full year",
                "Save 17% compared to monthly subscription",
                "Priority support",
                "Exclusive yearly member events",
                "Early access to new courses and features",
            ]
            break;

        case "month":
            benefits = [
                "Access to all premium courses",
                "Priority support",
                "Exclusive community features",
                "Monthly live Q&A sessions",
            ];

            break;
        default:
            break;
    }

    const [sessionValid, setSessionValid] = useState(false);
    const [isPending, setIsPending] = useState(true);


    useEffect(() => {
        const sessionCheck = async () => {
            try {
                const session = await stripe.checkout.sessions.retrieve(session_id!)
                if (session) {
                    setSessionValid(true)
                } else {
                    setSessionValid(false)
                }

            } catch (error) {
                console.log(error)
                setSessionValid(false)
            } finally {
                setIsPending(false)
            }
        }
        sessionCheck()
    }, [session_id]);

    if (isPending) {
        return (
            <div className=" text-xl font-semibold h-[90vh] text-center flex justify-center items-center text-destructive">
                <Loading />
            </div>
        )
    }

    if (!sessionValid) {
        return (
            <div className=" text-xl font-semibold h-[90vh] text-center flex justify-center items-center text-destructive">
                Session : {session_id} - is not valid
            </div>
        )
    }

    if (sessionValid) {

        return (
            <div className='container mx-auto px-4 py-8 md:py-16 max-w-4xl h-screen'>
                <Card className='w-full overflow-hidden'>
                    <div
                        className={`w-full h-2 ${planType === "year" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-blue-500"}`}
                    />
                    <CardHeader className='text-center'>
                        <div className='flex justify-center mb-4'>
                            {planType === "year" ? (
                                <Badge variant='secondary' className='text-lg px-3 py-1'>
                                    <Star className='mr-1 h-5 w-5 text-yellow-500' />
                                    Yearly Pro
                                </Badge>
                            ) : (
                                planType === "month" ?
                                    <Badge variant='secondary' className='text-lg px-3 py-1'>
                                        <Clock className='mr-1 h-5 w-5 text-blue-500' />
                                        Monthly Pro
                                    </Badge> : (
                                        <Badge variant='secondary' className='text-lg px-3 py-1'>
                                            <Clock className='mr-1 h-5 w-5 text-blue-500' />
                                            Daily Pro
                                        </Badge>
                                    )
                            )}
                        </div>
                        <CardTitle className='text-3xl md:text-4xl font-bold mb-2 text-primary'>Welcome to Pro!</CardTitle>
                        <CardDescription className='text-lg md:text-xl'>
                            You&apos;ve successfully subscribed to our {planType === "year" ? "Yearly" : (planType === "month" ? "Monthly" : "Daily")} Pro plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-6'>
                            <h3 className='text-xl md:text-2xl font-semibold'>Your Pro Benefits:</h3>
                            <ul className='space-y-3'>
                                {benefits?.map((benefit, index) => (
                                    <li key={index} className='flex items-center space-x-3 text-sm md:text-base'>
                                        <Check
                                            className={`flex-shrink-0 h-6 w-6 ${planType === "year" ? "text-purple-500" : (planType === "month" ? "text-sky-600" : "text-green-600")}`}
                                        />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className='flex flex-col space-y-4'>
                        <Button className='w-full text-lg' size='lg' onClick={() => router.push("/courses")}>
                            <Rocket className='mr-2 h-5 w-5' /> Start Your Pro Journey
                        </Button>
                        <p className='text-sm text-muted-foreground text-center'>
                            Excited to get started? Explore your new Pro features now!
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );
    }
};
export default SuccessPage;