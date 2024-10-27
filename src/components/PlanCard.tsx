import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { Check } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";


export type Plan = {
    id: "month" | "year" | "day";
    title: string;
    price: string;
    period: string;
    features: string[];
    ctaText: string;
    highlighted: boolean;
};


interface props {
    plan: Plan,
    isYearlySubscriptionActive: boolean,
    isMonthSubscriptionActive: boolean,
    userSubscription: { _id: Id<"subscriptions">; _creationTime: number; userId: Id<"users">; planType: "month" | "year" | "day"; currentPeriodStart: number; currentPeriodEnd: number; stripeSubscriptionId: string; status: string; cancelAtPeriodEnd: boolean; } | null | undefined
}

export default function PlanCard({ plan, isYearlySubscriptionActive, isMonthSubscriptionActive, userSubscription }: props) {

    const [isPending, setIsPending] = useState(false);
    const { user, isLoaded } = useUser()

    const createProPlanCheckoutSession = useAction(api.stripe.createProPlanCheckoutSession)

    const handleSelection = async (planId: "month" | "year" | "day") => {
        setIsPending(true)
        if (!user) return toast.error("Please login in to select a plan", { id: "login-error", position: 'top-center', duration: 3000 })

        try {
            const result = await createProPlanCheckoutSession({ planId })

            if (result.checkoutUrl) {
                window.location.assign(result.checkoutUrl)
            }
        } catch (err) {
            console.log((err as Error).message)
            if ((err as Error).message.includes('Rate limit exceeded')) {
                toast.error("Too many requests. please try again later")
            } else {
                toast.error("something went wrong")
            }
        } finally {
            setIsPending(false)
        }

    }

    return (
        <Card key={plan.id} className={cn('flex flex-col p-4 transition-all duration-300', plan.highlighted ? "border-purple-400 shadow-lg hover:shadow-xl" : "hover:border-purple-200 hover:shadow-md")}>
            <CardHeader className=" flex-grow">
                <CardTitle className={cn(' text-3xl mb-2 font-bold', plan.highlighted ? "text-purple-500" : "text-gray-800")}>
                    {plan.title}
                </CardTitle>
                <CardDescription className=" mt-2">
                    <span className=" text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className=" text-gray-600 ml-1">{plan.period}</span>
                </CardDescription>

                <CardContent>
                    <div className=" space-y-3 font-medium mt-4">
                        {plan.features.map((feature, index) => (
                            <p key={index} className=" flex  w-full items-center justify-start">
                                <Check className={cn('h-5 w-5 mr-2 flex-shrink-0', plan.highlighted ? "text-purple-500" : "text-green-500")} />
                                <span className=" text-gray-700">{feature}</span>
                            </p>
                        ))}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        disabled={isPending || userSubscription?.status === "active" && (userSubscription?.planType === plan.id || isYearlySubscriptionActive || (plan.id === "day" && isMonthSubscriptionActive))}
                        onClick={() => handleSelection(plan.id)}
                        className={cn(' mt-8 w-full py-6 text-lg font-medium', plan.highlighted ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50")}
                    >
                        {isPending ? (
                            <Loading />
                        ) : (isLoaded && userSubscription?.status === "active" && userSubscription.planType === plan.id ?
                            "Current Plan" : (
                                isLoaded && plan.id === "month" && isYearlySubscriptionActive ? "Yearly Plan Active" : plan.ctaText
                            )
                        )}
                    </Button>
                </CardFooter>
            </CardHeader>
        </Card>
    )
}
